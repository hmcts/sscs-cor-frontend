import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as moment from 'moment';
const config = require('config');

function extendSession(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ expireInSeconds: config.get('session.cookie.maxAgeInMs') }));
}

function setupSessionController(deps: any): Router {
  const router = Router();
  router.get(Paths.sessionExtension, deps.prereqMiddleware, extendSession);
  return router;
}

export {
  setupSessionController
};
