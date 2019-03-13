import { Router, Request, Response } from 'express';
import * as Paths from '../paths';

function getEvidenceOptions (req: Request, res: Response) {
  return res.render('additional-info/evidence-options.html');
}

function setupEvidenceOptionsController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.evidenceOptions, deps.prereqMiddleware, getEvidenceOptions);
  return router;
}

export {
  setupEvidenceOptionsController
};
