import { Router, Request, Response } from 'express';

import * as Paths from '../paths';

function getAdditionalInfo (req: Request, res: Response) {
  // TODO Logic should be added for now this is just an example.
  let additionalInfo = { state: 'evidencePost' };
  return res.render('additional-info/index.html', { additionalInfo });
}

function setupAdditionalInfoController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.additionalInfo, deps.prereqMiddleware, getAdditionalInfo);
  return router;
}

export {
  setupAdditionalInfoController
};
