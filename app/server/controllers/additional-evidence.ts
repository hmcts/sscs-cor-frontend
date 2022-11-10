import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';

import * as AppInsights from '../app-insights';
import {
  answerValidation,
  uploadDescriptionValidation,
} from '../utils/fieldValidation';
import * as Paths from '../paths';
import {
  AdditionalEvidenceService,
  EvidenceDescriptor,
} from '../services/additional-evidence';
import {
  handleFileUploadErrors,
  validateFileSize,
} from '../middleware/file-upload-validation';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
const multer = require('multer');
const i18next = require('i18next');
const mimeTypeWhitelist = require('../utils/mimeTypeWhitelist');
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('additional-evidence');
const fileTypeError = 'LIMIT_FILE_TYPE';
const limitOnlyDocument = 'LIMIT_UNEXPECTED_FILE';
const content = require('../../../locale/content');
const crypto = require('crypto');

const mediaFilesAllowed =
  config.get('featureFlags.mediaFilesAllowed') === 'true';

const maxDocumentFileSizeInMb: number = config.get(
  'evidenceUpload.maxFileSizeInMb'
);
const maxAudioVideoFileSizeInMb: number = config.get(
  'evidenceUpload.maxAudioVideoFileSizeInMb'
);

const upload = multer({
  limits: { fileSize: maxDocumentFileSizeInMb * 1048576 },
  fileFilter: fileTypeInWhitelist,
});

const uploadAudioVideo = multer({
  limits: { fileSize: maxAudioVideoFileSizeInMb * 1048576 },
  fileFilter: fileTypeAudioVideoInWhitelist,
});

const allowedActions = [
  'upload',
  'statement',
  'uploadAudioVideo',
  'post',
  'confirm',
];

function getAboutEvidence(req: Request, res: Response) {
  return res.render('additional-evidence/about-evidence.njk');
}

function postAdditionalEvidence(req: Request, res: Response) {
  const action = req.body['additional-evidence-option'];
  const url = `${Paths.additionalEvidence}/${action}`;
  if (isValidUrl(url)) {
    return res.redirect(url);
  }
  const errorMessage =
    content[i18next.language].additionalEvidence.evidenceOptions.error
      .noButtonSelected;
  res.render('additional-evidence/index.njk', {
    action: 'options',
    pageTitleError: true,
    error: errorMessage,
  });
}

function isValidUrl(url) {
  if (url.startsWith(`${Paths.additionalEvidence}`)) {
    return true;
  }
  return false;
}

function fileTypeInWhitelist(req, file, cb) {
  const fileExtension = (file.originalname || '').split('.').pop();
  if (
    mimeTypeWhitelist.mimeTypes.includes(file.mimetype) &&
    mimeTypeWhitelist.fileTypes.includes(fileExtension.toLocaleLowerCase())
  ) {
    cb(null, true);
  } else if (
    mimeTypeWhitelist.mimeTypesWithAudioVideo.includes(file.mimetype) &&
    mimeTypeWhitelist.fileTypesWithAudioVideo.includes(
      fileExtension.toLocaleLowerCase()
    )
  ) {
    const caseId = req.session['hearing'].case_id;
    logger.info(
      `[${caseId}] Allowed only upload letter, document or photo evidence on this page, file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Allowed only upload letter, document or photo evidence on this page, file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    cb(new multer.MulterError(limitOnlyDocument));
  } else {
    const caseId = req.session['hearing'].case_id;
    logger.info(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    cb(new multer.MulterError(fileTypeError));
  }
}

function fileTypeAudioVideoInWhitelist(req, file, cb) {
  const fileExtension = (file.originalname || '').split('.').pop();
  if (
    isFeatureEnabled(Feature.MEDIA_FILES_ALLOWED_ENABLED, req.cookies) &&
    mimeTypeWhitelist.mimeTypesWithAudioVideo.includes(file.mimetype) &&
    mimeTypeWhitelist.fileTypesWithAudioVideo.includes(
      fileExtension.toLocaleLowerCase()
    )
  ) {
    cb(null, true);
  } else {
    const caseId = req.session['hearing'].case_id;
    logger.info(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    AppInsights.trackTrace(
      `[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`
    );
    cb(new multer.MulterError(fileTypeError));
  }
}

function postEvidenceStatement(
  additionalEvidenceService: AdditionalEvidenceService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      const validationMessage = answerValidation(statementText, req);
      if (validationMessage) {
        res.render('additional-evidence/index.njk', {
          action: 'statement',
          pageTitleError: true,
          error: validationMessage,
        });
      } else {
        const caseId = req.session['hearing'].case_id;
        await additionalEvidenceService.saveStatement(
          caseId,
          statementText,
          req
        );
        AppInsights.trackTrace(`[${caseId}] - User has provided a statement`);
        res.redirect(`${Paths.additionalEvidence}/confirm`);
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function getAdditionalEvidence(
  additionalEvidenceService: AdditionalEvidenceService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string =
        !allowedActions.includes(req.params.action) || !req.params.action
          ? 'options'
          : req.params.action;
      if (action === 'upload') {
        const { description } = req.session['additional_evidence'] || '';
        const caseId = req.session['hearing'].case_id;
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(caseId, req);
        if (evidences) {
          evidences = evidences.reverse();
        } else {
          evidences = [];
        }
        return res.render('additional-evidence/index.njk', {
          action,
          evidences,
          description,
        });
      } else if (action === 'uploadAudioVideo') {
        // do nothing
      }
      const benefitType = req.session['appeal']!.benefitType;
      return res.render('additional-evidence/index.njk', {
        action,
        postBulkScan: isFeatureEnabled(Feature.POST_BULK_SCAN, req.cookies),
        benefitType,
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function postFileUpload(
  action: string,
  additionalEvidenceService: AdditionalEvidenceService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session['hearing'].case_id;
      const description = req.body['additional-evidence-description'] || '';
      req.session['additional_evidence'] = { description };
      if (action === 'upload' && req.file) {
        const evidence = await additionalEvidenceService.uploadEvidence(
          caseId,
          req.file,
          req
        );
        if (evidence && evidence.statusCode === 200) {
          const buffer: Buffer = req.file.buffer;
          const sha512Hash: string = crypto
            .createHash('sha512')
            .update(buffer)
            .digest('hex');
          const logMsg = `For case Id [${caseId}]  - User has uploaded this file [${req.file.originalname}] with a checksum of [${sha512Hash}]`;
          AppInsights.trackTrace(logMsg);
          logger.info(logMsg);
          return res.redirect(`${Paths.additionalEvidence}/upload`);
        }
        logger.info('Error while uploading evidence');
        const evidenceUploadErrorMsg =
          content[i18next.language].additionalEvidence.evidenceUpload.error
            .fileCannotBeUploaded;
        return res.render('additional-evidence/index.njk', {
          action: 'upload',
          pageTitleError: true,
          description,
          fileUploadError: evidenceUploadErrorMsg,
        });
      } else if (action === 'upload' && req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(caseId, fileId, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (action === 'upload' && req.body.buttonSubmit) {
        const evidenceDescription =
          req.session['additional_evidence'].description;
        const descriptionValidationMsg =
          uploadDescriptionValidation(evidenceDescription);
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(caseId, req);
        const evidencesValidationMsg =
          evidences.length > 0
            ? false
            : content[i18next.language].additionalEvidence.evidenceUpload.error
                .noFilesUploaded;
        if (evidences) {
          evidences = evidences.reverse();
        } else {
          evidences = [];
        }
        if (descriptionValidationMsg || evidencesValidationMsg) {
          return res.render('additional-evidence/index.njk', {
            action: 'upload',
            pageTitleError: true,
            evidences,
            description,
            error: descriptionValidationMsg,
            fileUploadError: evidencesValidationMsg,
          });
        }
        await additionalEvidenceService.submitEvidences(
          caseId,
          evidenceDescription,
          req
        );
        req.session['additional_evidence'].description = '';
        AppInsights.trackTrace(
          `[${caseId}] - User has uploaded a total of ${evidences.length} file(s)`
        );
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (action === 'uploadAudioVideo' && req.body.buttonSubmit) {
        const evidenceDescription =
          req.session['additional_evidence'].description;
        const descriptionValidationMsg =
          uploadDescriptionValidation(evidenceDescription);
        const evidencesValidationMsg = req.file
          ? false
          : content[i18next.language].additionalEvidence.evidenceUpload.error
              .noFilesUploaded;

        if (descriptionValidationMsg || evidencesValidationMsg) {
          return res.render('additional-evidence/index.njk', {
            action: 'uploadAudioVideo',
            pageTitleError: true,
            description,
            error: descriptionValidationMsg,
            fileUploadError: evidencesValidationMsg,
          });
        }

        await additionalEvidenceService.submitSingleEvidences(
          caseId,
          evidenceDescription,
          req.file,
          req
        );
        req.session['additional_evidence'].description = '';
        AppInsights.trackTrace(`[${caseId}] - User has uploaded a file`);
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (action === 'upload' && res.locals.multerError) {
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(caseId, req);
        if (evidences) {
          evidences.reverse();
        } else {
          evidences = [];
        }
        return res.render('additional-evidence/index.njk', {
          action: 'upload',
          pageTitleError: true,
          evidences,
          description,
          fileUploadError: res.locals.multerError,
        });
      } else if (action === 'uploadAudioVideo' && res.locals.multerError) {
        return res.render('additional-evidence/index.njk', {
          action: 'uploadAudioVideo',
          pageTitleError: true,
          description,
          fileUploadError: res.locals.multerError,
        });
      }
      return res.redirect(Paths.taskList);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function setupadditionalEvidenceController(deps: any) {
  const router = Router();
  router.get(Paths.aboutEvidence, deps.prereqMiddleware, getAboutEvidence);
  router.get(
    `${Paths.additionalEvidence}/:action?`,
    deps.prereqMiddleware,
    getAdditionalEvidence(deps.additionalEvidenceService)
  );

  const url = `${Paths.additionalEvidence}`;
  if (isValidUrl(url)) {
    router.post(url, deps.prereqMiddleware, postAdditionalEvidence);
  }
  router.post(
    `${Paths.additionalEvidence}/statement`,
    deps.prereqMiddleware,
    postEvidenceStatement(deps.additionalEvidenceService)
  );

  router.post(
    `${Paths.additionalEvidence}/upload`,
    deps.prereqMiddleware,
    upload.single('additional-evidence-file'),
    validateFileSize,
    handleFileUploadErrors,
    postFileUpload('upload', deps.additionalEvidenceService)
  );

  router.post(
    `${Paths.additionalEvidence}/uploadAudioVideo`,
    deps.prereqMiddleware,
    uploadAudioVideo.single('additional-evidence-audio-video-file'),
    validateFileSize,
    handleFileUploadErrors,
    postFileUpload('uploadAudioVideo', deps.additionalEvidenceService)
  );
  return router;
}

export {
  allowedActions,
  postEvidenceStatement,
  postAdditionalEvidence,
  getAboutEvidence,
  getAdditionalEvidence,
  setupadditionalEvidenceController,
  postFileUpload,
  fileTypeInWhitelist,
  fileTypeAudioVideoInWhitelist,
};
