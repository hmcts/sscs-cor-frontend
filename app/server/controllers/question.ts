import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { NextFunction, Request, Response, Router } from 'express';
import * as Paths from '../paths';
import * as path from 'path';
import { answerValidation } from '../utils/fieldValidation';
import * as config from 'config';
import { pageNotFoundHandler } from '../middleware/error-handler';
const multer = require('multer');
const i18next = require('i18next');
import { QuestionService } from '../services/question';
import { EvidenceService } from '../services/evidence';
const content = require('../../../locale/content');
const mimeTypeWhitelist = require('../utils/mimeTypeWhitelist');
import * as rp from 'request-promise';
import { OK, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { handleFileUploadErrors as handleFileUploadErrorsMiddleware } from '../middleware/file-upload-validation';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

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
        evidences: response.evidence ? response.evidence.reverse() : []
      };
      req.session.question = question;
      res.render('question/index.html', {
        question,
        showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies),
        postBulkScan: isFeatureEnabled(Feature.POST_BULK_SCAN, req.cookies)
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
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
      let validationMessage = answerValidation(answerText, req);

      if (!validationMessage) {
        await questionService.saveAnswer(hearingId, currentQuestionId, 'draft', answerText, req);
      } else if (req.body.save || req.body.submit) {
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
      } else if (res.locals.multerError) {
        const question = req.session.question;
        question.answer = {
          value: req.body['question-field']
        };
        return res.render('question/index.html', {
          question,
          showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidenceUploadOverrideAllowed, req.cookies),
          fileUploadError: res.locals.multerError
        });
      } else {
        res.redirect(Paths.taskList);
      }
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
      const error = res.locals.multerError || content.en.questionUploadEvidence.error.empty;
      return res.render('question/upload-evidence.html', { questionOrdinal, error });
    }
    try {
      const response: rp.Response = await evidenceService.upload(hearingId, currentQuestionId, req.file, req);
      if (response.statusCode === OK) {
        return res.redirect(`${Paths.question}/${questionOrdinal}`);
      }
      if (response.statusCode === UNPROCESSABLE_ENTITY) {
        const error = content[i18next.language].questionUploadEvidence.error.fileCannotBeUploaded;
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
      return next(new Error(errorMessage));
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
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

function setupQuestionController(deps) {
  const router = Router();
  router.get('/:questionOrdinal', deps.prereqMiddleware, getQuestion(deps.questionService));
  router.post('/:questionOrdinal',
    deps.prereqMiddleware,
    upload.single('file-upload-1'),
    handleFileUploadErrorsMiddleware,
    postAnswer(deps.questionService, deps.evidenceService)
  );
  router.get('/:questionOrdinal/upload-evidence',
    deps.prereqMiddleware,
    checkEvidenceUploadFeature(evidenceUploadEnabled, evidenceUploadOverrideAllowed),
    getUploadEvidence);
  router.post('/:questionOrdinal/upload-evidence',
    deps.prereqMiddleware,
    checkEvidenceUploadFeature(evidenceUploadEnabled, evidenceUploadOverrideAllowed),
    upload.single('file-upload-1'),
    handleFileUploadErrorsMiddleware,
    postUploadEvidence(deps.questionService, deps.evidenceService, false)
  );
  return router;
}

export {
  setupQuestionController,
  getQuestion,
  postAnswer,
  getUploadEvidence,
  postUploadEvidence,
  fileTypeInWhitelist
};
