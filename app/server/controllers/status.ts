import { Router, Request, Response } from 'express';
import * as Paths from '../paths';

function getStatus(req: Request, res: Response) {
  return res.render('status.html');
}

function setupStatusController(deps: any) {
  const router = Router();
  router.get(Paths.status, deps.prereqMiddleware, getStatus);

  return router;
}

export {
    getStatus,
    setupStatusController
};
