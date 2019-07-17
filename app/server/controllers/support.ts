import { Router, Request, Response } from 'express';
import * as Paths from '../paths';

function getSupportEvidence(req: Request, res: Response) {
  res.render('help-guides/support-evidence.html', { req });
}

function setupSupportEvidenceController(deps: any): Router {
  const router = Router();
  router.get(Paths.supportEvidence,deps.setLocals, getSupportEvidence);
  return router;
}

export {
    setupSupportEvidenceController,
    getSupportEvidence
};
