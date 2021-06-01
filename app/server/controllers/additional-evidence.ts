import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';
const multer = require('multer');
const i18next = require('i18next');
const mimeTypeWhitelist = require('../utils/mimeTypeWhitelist');
import * as AppInsights from '../app-insights';
import { answerValidation, uploadDescriptionValidation } from '../utils/fieldValidation';
import * as Paths from '../paths';
import { AdditionalEvidenceService, EvidenceDescriptor } from '../services/additional-evidence';
import { handleFileUploadErrors, validateFileSize } from '../middleware/file-upload-validation';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('additional-evidence');
const fileTypeError = 'LIMIT_FILE_TYPE';
const content = require('../../../locale/content');
const crypto = require('crypto');
const mediaFilesAllowed = config.get('featureFlags.mediaFilesAllowed') === 'true';

const maxFileSizeInMb: number = (mediaFilesAllowed ? config.get('evidenceUpload.maxAudioVideoFileSizeInMb') : config.get('evidenceUpload.maxFileSizeInMb'));

const upload = multer({
  limits: { fileSize:  maxFileSizeInMb * 1048576 },
  fileFilter: fileTypeInWhitelist
});

const allowedActions = [
  'upload',
  'statement',
  'post',
  'confirm'
];

function getAboutEvidence(req: Request, res: Response) {
  return res.render('additional-evidence/about-evidence.html');
}

function postAdditionalEvidence (req: Request, res: Response) {
  const action = req.body['additional-evidence-option'];
  const url = `${Paths.additionalEvidence}/${action}`;
  if (isValidUrl(url)) {
    return res.redirect(url);
  } else {
    const errorMessage = content[i18next.language].additionalEvidence.evidenceOptions.error.noButtonSelected;
    res.render('additional-evidence/index.html', { action: 'options', pageTitleError: true, error: errorMessage });
  }
}

function isValidUrl(url) {
  if (url.startsWith(`${Paths.additionalEvidence}`)) {
    return true;
  }
  return false;
}

function fileTypeInWhitelist(req, file, cb) {
  const fileExtension = (file.originalname || '').split('.').pop();
  if (isFeatureEnabled(Feature.MEDIA_FILES_ALLOWED_ENABLED, req.cookies) && mimeTypeWhitelist.mimeTypesWithAudioVideo.includes(file.mimetype) && mimeTypeWhitelist.fileTypesWithAudioVideo.includes(fileExtension.toLocaleLowerCase())) {
    cb(null, true);
  } else if (mimeTypeWhitelist.mimeTypes.includes(file.mimetype) && mimeTypeWhitelist.fileTypes.includes(fileExtension.toLocaleLowerCase())) {
    cb(null, true);
  } else {
    const caseId = req.session['hearing'].case_id;
    logger.info(`[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`);
    AppInsights.trackTrace(`[${caseId}] Unsupported file type uploaded with file name – ${file.originalname} and mimetype - ${file.mimetype}`);
    cb(new multer.MulterError(fileTypeError));
  }
}

function postEvidenceStatement(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      const validationMessage = answerValidation(statementText, req);

      if (!validationMessage) {
        const caseId = req.session['hearing'].case_id;
        await additionalEvidenceService.saveStatement(caseId, statementText, req);
        AppInsights.trackTrace(`[${caseId}] - User has provided a statement`);
        res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else {
        res.render('additional-evidence/index.html', { action : 'statement', pageTitleError: true, error: validationMessage });
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function getAdditionalEvidence() {
  return async(req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string = (!allowedActions.includes(req.params.action) || !req.params.action) ? 'options' : req.params.action;
      const benefitType = req.session['appeal'].benefitType;
      return res.render('additional-evidence/index.html', {
        action,
        postBulkScan: isFeatureEnabled(Feature.POST_BULK_SCAN, req.cookies),
        benefitType
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function postFileUpload(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session['hearing'].case_id;
      const description = req.body['additional-evidence-description'] || '';
      req.session['additional_evidence'] = { description };

      if (req.body.buttonSubmit) {
        const evidenceDescription = req.session['additional_evidence'].description;
        const descriptionValidationMsg = uploadDescriptionValidation(evidenceDescription);
        const evidencesValidationMsg = req.file ? false : content[i18next.language].additionalEvidence.evidenceUpload.error.noFilesUploaded;

        if (descriptionValidationMsg || evidencesValidationMsg) {
          return res.render('additional-evidence/index.html',
            {
              action: 'upload',
              pageTitleError: true,
              description,
              error: descriptionValidationMsg,
              fileUploadError: evidencesValidationMsg
            }
          );
        }

        const buffer: Buffer = req.file.buffer;
        // NOSONAR
        const md5Hash: String = crypto.createHash('md5').update(buffer).digest('hex');
        const logMsg = `For case Id [${caseId}]  - User has uploaded this file [${req.file.originalname}] with a checksum of [${md5Hash}]`;
        AppInsights.trackTrace(logMsg);
        logger.info(logMsg);

        await additionalEvidenceService.submitEvidences(caseId, evidenceDescription, req.file, req);
        req.session['additional_evidence'].description = '';
        AppInsights.trackTrace(`[${caseId}] - User has uploaded a file`);
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (res.locals.multerError) {

        return res.render('additional-evidence/index.html',
          {
            action: 'upload',
            pageTitleError: true,
            description,
            fileUploadError: res.locals.multerError
          }
        );
      } else {
        return res.redirect(Paths.taskList);
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function setupadditionalEvidenceController(deps: any) {
  const router = Router();
  router.get(Paths.aboutEvidence, deps.prereqMiddleware, getAboutEvidence);
  router.get(`${Paths.additionalEvidence}/:action?`,
      deps.prereqMiddleware
  );

  const url = `${Paths.additionalEvidence}`;
  if (isValidUrl(url)) {
    router.post(url, deps.prereqMiddleware, postAdditionalEvidence);
  }
  router.post(`${Paths.additionalEvidence}/statement`,
    deps.prereqMiddleware,
    postEvidenceStatement(deps.additionalEvidenceService)
  );

  router.post(`${Paths.additionalEvidence}/upload`,
    deps.prereqMiddleware,
    upload.single('additional-evidence-file'),
    validateFileSize,
    handleFileUploadErrors,
    postFileUpload(deps.additionalEvidenceService)
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
  fileTypeInWhitelist
};
