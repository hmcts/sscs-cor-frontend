import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';
const multer = require('multer');
import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { answerValidation, uploadDescriptionValidation } from '../utils/fieldValidation';
import * as Paths from '../paths';
import { AdditionalEvidenceService, EvidenceDescriptor } from '../services/additional-evidence';
import { handleFileUploadErrors } from '../middleware/file-upload-validation';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

const i18n = require('../../../locale/en');

const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

const upload = multer({
  limits: { fileSize:  maxFileSizeInMb * 1048576 }
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
  return res.redirect(`${Paths.additionalEvidence}/${action}`);
}

function postEvidenceStatement(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      const validationMessage = answerValidation(statementText, req);

      if (!validationMessage) {
        const caseId = req.session.hearing.case_id;
        await additionalEvidenceService.saveStatement(caseId, statementText, req);
        res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else {
        res.render('additional-evidence/index.html', { action : 'statement', error: validationMessage });
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
        const { description } = req.session.additional_evidence || '';
        const caseId = req.session.hearing.case_id;
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);
        return res.render('additional-evidence/index.html',
          {
            action,
            evidences: evidences ? evidences.reverse() : [],
            description
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

function postFileUpload(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session.hearing.case_id;
      const description = req.body['additional-evidence-description'] || '';
      req.session.additional_evidence = { description };
      if (req.file) {
        await additionalEvidenceService.uploadEvidence(caseId, req.file, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(caseId, fileId, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.buttonSubmit) {
        const evidenceDescription = req.session.additional_evidence.description;
        const descriptionValidationMsg = uploadDescriptionValidation(evidenceDescription);
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);
        const evidencesValidationMsg = evidences.length ? false : i18n.additionalEvidence.evidenceUpload.error.noFilesUploaded;

        if (descriptionValidationMsg || evidencesValidationMsg) {
          return res.render('additional-evidence/index.html',
            {
              action: 'upload',
              evidences: evidences ? evidences.reverse() : [],
              description,
              error: descriptionValidationMsg,
              fileUploadError: evidencesValidationMsg
            }
          );
        }
        await additionalEvidenceService.submitEvidences(caseId, evidenceDescription, req);
        req.session.additional_evidence.description = '';
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
      } else if (res.locals.multerError) {
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(caseId, req);

        return res.render('additional-evidence/index.html',
          {
            action: 'upload',
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
  postFileUpload
};
