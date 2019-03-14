import { Router, Request, Response } from 'express';

import * as Paths from '../paths';

function getadditionalEvidence (req: Request, res: Response) {
  // TODO Logic should be added for now this is just an example.
  let additionalEvidence = { state: 'evidencePost' };
  return res.render('additional-evidence/index.html', { additionalEvidence });
}

function setupadditionalEvidenceController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.additionalEvidence, deps.prereqMiddleware, getadditionalEvidence);
  return router;
}

export {
  setupadditionalEvidenceController
};
