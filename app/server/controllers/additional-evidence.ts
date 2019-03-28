
import { NextFunction, Request, Response, Router } from 'express';
import * as AppInsights from '../app-insights';
import { answerValidation } from '../utils/fieldValidation';
import * as Paths from '../paths';
import { AdditionalEvidenceService } from '../services/additional-evidence';

const allowedActions = [
  'upload',
  'statement',
  'post',
  'confirm'
];

function getAboutEvidence(req: Request, res: Response) {
  return res.render('additional-evidence/about-evidence.html');
}

function getadditionalEvidence (req: Request, res: Response) {
  const action: string =
    (!allowedActions.includes(req.params.action) || !req.params.action) ?
      'options'
      :
      req.params.action;

  return res.render('additional-evidence/index.html', { action });
}

function postAdditionalEvidence (req: Request, res: Response) {
  return res.render('additional-evidence/index.html', { action: req.body['additional-evidence-option'] });
}

function postEvidenceStatement(additionalEvidenceService: AdditionalEvidenceService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const statementText = req.body['question-field'];

    try {
      await validateAnswer(req, res, statementText, async () => {
        if (statementText.length > 0) {
          await additionalEvidenceService.saveStatement(statementText, req);
          res.redirect(`${Paths.additionalEvidence}/confirm`);
        }
      });
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
  router.get(Paths.aboutEvidence, deps.prereqMiddleware, getAboutEvidence);
  router.get(`${Paths.additionalEvidence}/:action?`, deps.prereqMiddleware, getadditionalEvidence);
  router.post(`${Paths.additionalEvidence}`, deps.prereqMiddleware, postAdditionalEvidence);

  router.post(`${Paths.additionalEvidence}/statement`,
    deps.prereqMiddleware,
    postEvidenceStatement(deps.additionalEvidenceService)
  );

  return router;
}

export {
  allowedActions,
  postEvidenceStatement,
  postAdditionalEvidence,
  getAboutEvidence,
  getadditionalEvidence,
  setupadditionalEvidenceController
};
