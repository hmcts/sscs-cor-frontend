import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { NextFunction, Request, Response, Router } from 'express';
import * as Paths from '../paths';
import * as path from 'path';
import { answerValidation } from '../utils/fieldValidation';
import * as config from 'config';
import { pageNotFoundHandler } from '../middleware/error-handler';
const multer = require('multer');
import { QuestionService } from '../services/question';
import { EvidenceService } from '../services/evidence';
const i18n = require('../../../locale/en.json');
const mimeTypeWhitelist = require('../utils/mimeTypeWhitelist');
import * as rp from 'request-promise';
import { OK, UNPROCESSABLE_ENTITY } from 'http-status-codes';

const evidenceUploadEnabled = config.get('evidenceUpload.questionPage.enabled') === 'true';
const evidenceUploadOverrideAllowed = config.get('evidenceUpload.questionPage.overrideAllowed') === 'true';
const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');
const fileTypeError = 'LIMIT_FILE_TYPE';

const upload = multer({
  limits: { fileSize:  maxFileSizeInMb * 1048576 },
  fileFilter: fileTypeInWhitelist
});

export function showEvidenceUpload(evidenceUploadEnabled: boolean, evidendeUploadOverrideAllowed?: boolean, cookies?): boolean {
  if (evidenceUploadEnabled) {
    return true;
  }
  if (evidendeUploadOverrideAllowed && cookies && cookies.evidenceUploadOverride === 'true') {
    return true;
  }
  return false;
}

function getQuestion(questionService: QuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    const currentQuestionId = questionService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;
    try {
      const response = await questionService.getQuestion(hearingId, currentQuestionId, req);

      const question = {
        questionId: currentQuestionId,
        questionOrdinal: questionOrdinal,
        header: response.question_header_text,
        body: response.question_body_text,
        answer_state: response.answer_state,
        answer: {
          value: response.answer,
          date: response.answer_date
        },
        evidence: _.sortBy(_.map(response.evidence, (i) => ({ filename: i.file_name, id: i.id })), 'created_date').reverse()
      };
      req.session.question = question;
      res.render('question/index.html', {
        question,
        showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies)
      });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

async function validateAnswer(req: Request, res: Response, answerText: string, callback) {
  let validationMessage;
  if (req.body.save || req.body.submit) {
    validationMessage = answerValidation(answerText, req);
  }

  if (validationMessage) {
    const question = req.session.question;
    question.answer = {
      value: answerText,
      error: validationMessage
    };
    return res.render('question/index.html', {
      question,
      showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies)
    });
  }
  await callback();
}

function postAnswer(questionService: QuestionService, evidenceService: EvidenceService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    const currentQuestionId = questionService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;
    const answerText = req.body['question-field'];

    try {
      await validateAnswer(req, res, answerText, async () => {
        if (answerText.length > 0) {
          await questionService.saveAnswer(hearingId, currentQuestionId, 'draft', answerText, req);
        }

        if (req.file) {
          return postUploadEvidence(questionService, evidenceService, true)(req, res, next);
        } else if (req.body['add-file']) {
          return res.redirect(`${Paths.question}/${questionOrdinal}/upload-evidence`);
        } else if (req.body.delete) {
          const fileId = Object.keys(req.body.delete)[0];
          await evidenceService.remove(hearingId, currentQuestionId, fileId, req);
          return res.redirect(`${Paths.question}/${questionOrdinal}`);
        } else if (req.body.submit) {
          res.redirect(`${Paths.question}/${questionOrdinal}/submit`);
        } else {
          res.redirect(Paths.taskList);
        }
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function checkEvidenceUploadFeature(enabled, overridable) {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowed = showEvidenceUpload(enabled, overridable, req.cookies);
    if (allowed) {
      return next();
    }
    return pageNotFoundHandler(req, res);
  };
}

function getUploadEvidence(req: Request, res: Response, next: NextFunction) {
  const questionOrdinal: string = req.params.questionOrdinal;
  res.render('question/upload-evidence.html', { questionOrdinal });
}

function postUploadEvidence(questionService: QuestionService, evidenceService: EvidenceService, isJsUpload: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    const currentQuestionId = questionService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }

    const hearingId = req.session.hearing.online_hearing_id;

    if (!req.file) {
      const error = i18n.questionUploadEvidence.error.empty;
      return res.render('question/upload-evidence.html', { questionOrdinal, error });
    }
    try {
      const response: rp.Response = await evidenceService.upload(hearingId, currentQuestionId, req.file, req);
      if (response.statusCode === OK) {
        return res.redirect(`${Paths.question}/${questionOrdinal}`);
      }
      if (response.statusCode === UNPROCESSABLE_ENTITY) {
        const error = i18n.questionUploadEvidence.error.fileCannotBeUploaded;
        if (isJsUpload) {
          const question = req.session.question;
          return res.render('question/index.html', {
            question,
            showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies),
            fileUploadError: error
          });
        }
        return res.render('question/upload-evidence.html', { questionOrdinal, error });
      }
      const errorMessage = `Cannot upload evidence ${JSON.stringify(response)}`;
      AppInsights.trackException(errorMessage);
      next(new Error(errorMessage));
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function fileTypeInWhitelist(req, file, cb) {
  const fileExtension = path.extname(file.originalname);
  if (mimeTypeWhitelist.mimeTypes.includes(file.mimetype) && mimeTypeWhitelist.fileTypes.includes(fileExtension.toLocaleLowerCase())) {
    cb(null, true);
  } else {
    cb(new multer.MulterError(fileTypeError));
  }
}

function handleFileUploadErrors(isJsUpload: boolean) {
  return (err, req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    if (err instanceof multer.MulterError) {
      let error = i18n.questionUploadEvidence.error.fileCannotBeUploaded;
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = `${i18n.questionUploadEvidence.error.tooLarge} ${maxFileSizeInMb}MB.`;
      } else if (err.code === fileTypeError) {
        error = i18n.questionUploadEvidence.error.invalidFileType;
      }
      if (isJsUpload) {
        const question = req.session.question;
        question.answer = {
          value: req.body['question-field']
        };
        return res.render('question/index.html', {
          question,
          showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies),
          fileUploadError: error
        });
      }
      return res.render('question/upload-evidence.html', { questionOrdinal, error });
    }
    next(err);
  };
}

function setupQuestionController(deps) {
  const router = Router();
  router.get('/:questionOrdinal', deps.prereqMiddleware, getQuestion(deps.questionService));
  router.post('/:questionOrdinal',
    deps.prereqMiddleware,
    upload.single('file-upload-1'),
    postAnswer(deps.questionService, deps.evidenceService),
    handleFileUploadErrors(true)
  );
  router.get('/:questionOrdinal/upload-evidence',
    deps.prereqMiddleware,
    checkEvidenceUploadFeature(evidenceUploadEnabled, evidenceUploadOverrideAllowed),
    getUploadEvidence);
  router.post('/:questionOrdinal/upload-evidence',
    deps.prereqMiddleware,
    checkEvidenceUploadFeature(evidenceUploadEnabled, evidenceUploadOverrideAllowed),
    upload.single('file-upload-1'),
    postUploadEvidence(deps.questionService, deps.evidenceService, false),
    handleFileUploadErrors(false)
  );
  return router;
}

export {
  setupQuestionController,
  getQuestion,
  postAnswer,
  getUploadEvidence,
  postUploadEvidence,
  handleFileUploadErrors,
  fileTypeInWhitelist
};
