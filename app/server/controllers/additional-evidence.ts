import { Router, Request, Response } from 'express';

import * as Paths from '../paths';

const allowedActions = [
  'upload',
  'statement',
  'post'
];

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

function setupadditionalEvidenceController(deps: any) {
  const router = Router();
  router.get(`${Paths.additionalEvidence}/:action?`, deps.prereqMiddleware, getadditionalEvidence);
  router.post(`${Paths.additionalEvidence}`, deps.prereqMiddleware, postAdditionalEvidence);
  return router;
}

export {
  allowedActions,
  getadditionalEvidence,
  setupadditionalEvidenceController
};
