import { NextFunction, Request, Response, Router } from 'express';
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
  upload,
  uploadAudioVideo,
  validateFileSize,
} from '../middleware/fileUpload';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import { Dependencies } from '../routes';
import HttpException from '../exceptions/HttpException';
import { BAD_REQUEST } from 'http-status-codes';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { Appeal, CaseDetails } from '../models/express-session';
import i18next from 'i18next';
import crypto from 'crypto';
import content from '../../common/locale/content.json';

const logger: LoggerInstance = Logger.getLogger('additional-evidence');

export const allowedActions = [
  'upload',
  'statement',
  'uploadAudioVideo',
  'post',
  'confirm',
];

function isValidUrl(url: string): boolean {
  return url.startsWith(`${Paths.additionalEvidence}`);
}

export function getAboutEvidence(req: Request, res: Response): void {
  return res.render('additional-evidence/about-evidence.njk');
}

export function postAdditionalEvidence(req: Request, res: Response): void {
  const action = req.body['additional-evidence-option'];
  const url = `${Paths.additionalEvidence}/${action}`;
  if (isValidUrl(url) && action) {
    return res.redirect(url);
  }
  const errorMessage =
    content[i18next.language].additionalEvidence.evidenceOptions.error
      .noButtonSelected;
  return res.render('additional-evidence/index.njk', {
    action: 'options',
    pageTitleError: true,
    error: errorMessage,
  });
}

export function getCaseId(req: Request): number {
  const caseDetails: CaseDetails = req.session.case;
  if (!caseDetails) {
    const error = new HttpException(
      BAD_REQUEST,
      `No Case for session ${req.sessionID}`
    );
    logger.error(error.message, error);
    throw error;
  }
  return caseDetails.case_id;
}

export function postEvidenceStatement(
  additionalEvidenceService: AdditionalEvidenceService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];
    try {
      const validationMessage = answerValidation(statementText, req);
      if (validationMessage) {
        return res.render('additional-evidence/index.njk', {
          action: 'statement',
          pageTitleError: true,
          error: validationMessage,
        });
      }
      const caseId = getCaseId(req);
      await additionalEvidenceService.saveStatement(
        String(caseId),
        statementText,
        req
      );
      AppInsights.trackTrace(`[${caseId}] - User has provided a statement`);
      return res.redirect(`${Paths.additionalEvidence}/confirm`);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function getAdditionalEvidence(
  additionalEvidenceService: AdditionalEvidenceService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string =
        !allowedActions.includes(req.params.action) || !req.params.action
          ? 'options'
          : req.params.action;
      if (action === 'upload') {
        const { description } = req.session.additional_evidence || {
          description: '',
        };
        const caseId = getCaseId(req);
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(String(caseId), req);
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
      const appeal: Appeal = req.session.appeal;
      const benefitType = appeal?.benefitType ? appeal.benefitType : '';
      return res.render('additional-evidence/index.njk', {
        action,
        benefitType,
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function postFileUpload(
  action: string,
  additionalEvidenceService: AdditionalEvidenceService
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = getCaseId(req);
      const description = req.body['additional-evidence-description'] || '';
      req.session.additional_evidence = { description };
      if (action === 'upload' && req.file) {
        const evidence = await additionalEvidenceService.uploadEvidence(
          String(caseId),
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
        await additionalEvidenceService.removeEvidence(
          String(caseId),
          fileId,
          req
        );
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (action === 'upload' && req.body.buttonSubmit) {
        const evidenceDescription = req.session.additional_evidence.description;
        const descriptionValidationMsg =
          uploadDescriptionValidation(evidenceDescription);
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(String(caseId), req);
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
          String(caseId),
          evidenceDescription,
          req
        );
        req.session.additional_evidence.description = '';
        AppInsights.trackTrace(
          `[${caseId}] - User has uploaded a total of ${evidences.length} file(s)`
        );
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (action === 'uploadAudioVideo' && req.body.buttonSubmit) {
        const evidenceDescription = req.session.additional_evidence.description;
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
          String(caseId),
          evidenceDescription,
          req.file,
          req
        );
        req.session.additional_evidence.description = '';
        AppInsights.trackTrace(`[${caseId}] - User has uploaded a file`);
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (action === 'upload' && res.locals.multerError) {
        let evidences: EvidenceDescriptor[] =
          await additionalEvidenceService.getEvidences(String(caseId), req);
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

export function setupAdditionalEvidenceController(deps: Dependencies): Router {
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
    upload,
    validateFileSize,
    handleFileUploadErrors,
    postFileUpload('upload', deps.additionalEvidenceService)
  );

  router.post(
    `${Paths.additionalEvidence}/uploadAudioVideo`,
    deps.prereqMiddleware,
    uploadAudioVideo,
    validateFileSize,
    handleFileUploadErrors,
    postFileUpload('uploadAudioVideo', deps.additionalEvidenceService)
  );
  return router;
}
