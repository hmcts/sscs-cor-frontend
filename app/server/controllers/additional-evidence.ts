import { NextFunction, Request, Response, Router } from 'express';
import * as config from 'config';
const multer = require('multer');
const cache = require('memory-cache');
import * as _ from 'lodash';
import * as AppInsights from '../app-insights';
import { answerValidation } from '../utils/fieldValidation';
import * as Paths from '../paths';
import { AdditionalEvidenceService, EvidenceDescriptor } from '../services/additional-evidence';

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

function postAdditionalEvidence (req: Request, res: Response) {
  return res.render('additional-evidence/index.html', { action: req.body['additional-evidence-option'] });
}

function postEvidenceStatement(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      await validateAnswer(req, res, statementText, async () => {
        if (statementText.length > 0) {
          const hearingId = req.session.hearing.online_hearing_id;
          await additionalEvidenceService.saveStatement(hearingId, statementText);
          res.redirect(`${Paths.additionalEvidence}/confirm`);
        }
      });
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
        const success = req.query.hasOwnProperty('success') ? true : false;
        const hearingId = req.session.hearing.online_hearing_id;
        const evidences: EvidenceDescriptor[] = await additionalEvidenceService.getEvidences(hearingId);
        const question = {
          evidence: _.sortBy(_.map(evidences, (i) => ({ filename: i.file_name, id: i.id })), 'created_date').reverse()
        };
        return res.render('additional-evidence/index.html', { action, question, success });
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
        await additionalEvidenceService.uploadEvidence(hearingId, req.file);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        await additionalEvidenceService.removeEvidence(hearingId, fileId);
        return res.redirect(`${Paths.additionalEvidence}/upload`);
      } else if (req.body.buttonSubmit) {
        await additionalEvidenceService.submitEvidences(hearingId);
        return res.redirect(`${Paths.additionalEvidence}/upload?success`);
      } else {
        return res.redirect(Paths.taskList);
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

async function validateAnswer(req: Request, res: Response, answerText: string, callback) {
  let validationMessage;
  if (req.body.submit) {
    validationMessage = answerValidation(answerText, req);
  }

  if (validationMessage) {
    const statement = { error: validationMessage };
    return res.render('additional-evidence/index.html', { statement , action : 'statement' });
  }
  await callback();
}

function setupadditionalEvidenceController(deps: any) {
  const router = Router();
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
  getAdditionalEvidence,
  setupadditionalEvidenceController,
  postEvidenceStatement,
  postAdditionalEvidence,
  postFileUpload
};
