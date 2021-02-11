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

  if (action) {
    return res.redirect(`${Paths.additionalEvidence}/${action}`);
  } else {
    const errorMessage = content[i18next.language].additionalEvidence.evidenceOptions.error.noButtonSelected;
    res.render('additional-evidence/index.html', { action: 'options', pageTitleError: true, error: errorMessage });
  }
}

function fileTypeInWhitelist(req, file, cb) {
  const fileExtension = (file.originalname || '').split('.').pop();
  if (mimeTypeWhitelist.mimeTypes.includes(file.mimetype) && mimeTypeWhitelist.fileTypes.includes(fileExtension.toLocaleLowerCase())) {
    cb(null, true);
  } else {
    const caseId = req.session['hearing'].case_id;
    logger.info(`[${caseId}] Unsupported file type uploaded with file name – ${file.originalname}`);
    AppInsights.trackTrace(`[${caseId}] Unsupported file type uploaded with file name – ${file.originalname}`);
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

function getAdditionalEvidence(additionalEvidenceService: AdditionalEvidenceService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string = (!allowedActions.includes(req.params.action) || !req.params.action) ? 'options' : req.params.action;
      if (action === 'upload') {
        const { description } = req.session['additional_evidence'] || '';
        const caseId = req.session['hearing'].case_id;
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);
        const hasAudioVideoFile = checkAudioVideoFile(evidences);

        return res.render('additional-evidence/index.html',
          {
            action,
            evidences: evidences ? evidences.reverse() : [],
            description,
            hasAudioVideoFile
          }
        );
      }
      return res.render('additional-evidence/index.html', {
        action,
        postBulkScan: isFeatureEnabled(Feature.POST_BULK_SCAN, req.cookies)
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function checkAudioVideoFile(evidences: EvidenceDescriptor[]) {
  let hasAudioVideoFile = false;
  evidences.forEach(evidences => {
    if (evidences.file_name.toLowerCase().endsWith('.mp3') || evidences.file_name.toLowerCase().endsWith('.mp4')) {
      hasAudioVideoFile = true;
    }
  });
  return hasAudioVideoFile;
}

function postFileUpload(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session['hearing'].case_id;
      const description = req.body['additional-evidence-description'] || '';
      req.session['additional_evidence'] = { description };
      if (req.file) {
        await additionalEvidenceService.uploadEvidence(caseId, req.file, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(caseId, fileId, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.buttonSubmit) {
        const evidenceDescription = req.session['additional_evidence'].description;
        const descriptionValidationMsg = uploadDescriptionValidation(evidenceDescription);
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);
        const evidencesValidationMsg = evidences.length ? false : content[i18next.language].additionalEvidence.evidenceUpload.error.noFilesUploaded;

        if (descriptionValidationMsg || evidencesValidationMsg) {
          return res.render('additional-evidence/index.html',
            {
              action: 'upload',
              pageTitleError: true,
              evidences: evidences ? evidences.reverse() : [],
              description,
              error: descriptionValidationMsg,
              fileUploadError: evidencesValidationMsg
            }
          );
        }
        await additionalEvidenceService.submitEvidences(caseId, evidenceDescription, req);
        req.session['additional_evidence'].description = '';
        AppInsights.trackTrace(`[${caseId}] - User has uploaded a total of ${evidences.length} file(s)`);
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (res.locals.multerError) {
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);

        return res.render('additional-evidence/index.html',
          {
            action: 'upload',
            pageTitleError: true,
            evidences: evidences ? evidences.reverse() : [],
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
    deps.prereqMiddleware,
    getAdditionalEvidence(deps.additionalEvidenceService)
  );
  router.post(`${Paths.additionalEvidence}`, deps.prereqMiddleware, postAdditionalEvidence);

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
