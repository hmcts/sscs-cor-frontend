import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';
const multer = require('multer');
import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { answerValidation, uploadDescriptionValidation } from '../utils/fieldValidation';
import * as Paths from '../paths';
import { AdditionalEvidenceService, EvidenceDescriptor } from '../services/additional-evidence';
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
        const hearingId = req.session.hearing.online_hearing_id;
        await additionalEvidenceService.saveStatement(hearingId, statementText, req);
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
        const hearingId = req.session.hearing.online_hearing_id;
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(hearingId, req);
        const question = {
          evidence: _.sortBy(_.map(evidences, (i) => ({ filename: i.file_name, id: i.id })), 'created_date').reverse()
        };
        return res.render('additional-evidence/index.html', { action, question, description });
      }
      return res.render('additional-evidence/index.html', { action });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function postFileUpload(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hearingId = req.session.hearing.online_hearing_id;
      const description = req.body['additional-evidence-description'] || '';
      req.session.additional_evidence = { description };
      if (req.file) {
        await additionalEvidenceService.uploadEvidence(hearingId, req.file, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(hearingId, fileId, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.buttonSubmit) {
        const evidenceDescription = req.session.additional_evidence.description;
        const descriptionValidationMsg = uploadDescriptionValidation(evidenceDescription);
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(hearingId, req);
        const evidencesValidationMsg = evidences.length ? false : i18n.additionalEvidence.evidenceUpload.error.noFilesUploaded;

        if (descriptionValidationMsg || evidencesValidationMsg) {
          const question = {
            evidence: _.sortBy(_.map(evidences, (i) => ({ filename: i.file_name, id: i.id })), 'created_date').reverse()
          };
          return res.render('additional-evidence/index.html',
            {
              action: 'upload',
              question,
              description,
              error: descriptionValidationMsg,
              fileUploadError: evidencesValidationMsg
            }
          );
        }
        await additionalEvidenceService.submitEvidences(hearingId, evidenceDescription, req);
        req.session.additional_evidence.description = '';
        return res.redirect(`${Paths.additionalEvidence}/confirm`);
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
