import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';
const multer = require('multer');
const cache = require('memory-cache');
import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { answerValidation } from '../utils/fieldValidation';
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
  return res.render('additional-evidence/index.html', { action: req.body['additional-evidence-option'] });
}

function postEvidenceStatement(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      let validationMessage = answerValidation(statementText, req);

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
        const hearingId = req.session.hearing.online_hearing_id;
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(hearingId, req);
        const question = {
          evidence: _.sortBy(_.map(evidences, (i) => ({ filename: i.file_name, id: i.id })), 'created_date').reverse()
        };
        const validationMessage = req.query.hasOwnProperty('error') ? i18n.question.textareaField.errorOnSave.empty : false;
        return res.render('additional-evidence/index.html', { action, question, error: validationMessage });
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
      if (req.file) {
        await additionalEvidenceService.uploadEvidence(hearingId, req.file, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(hearingId, fileId, req);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.buttonSubmit) {
        const evidenceDescription = req.body['additional-evidence-description'];
        let error = answerValidation(evidenceDescription);
        if (error) {
          return res.redirect(`${Paths.additionalEvidence}/upload?error`);
        }
        await additionalEvidenceService.submitEvidences(hearingId, req);
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
