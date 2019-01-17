import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as moment from 'moment';

function extendSession(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  const expiry: Date = new Date(req.session.cookie.expires.toString()) || moment().add(30, 'minute').toDate();
  res.send(JSON.stringify({ expireInSeconds: moment(expiry).diff(moment(),'s') }));
}

function setupSessionController(deps: any): Router {
  const router = Router();
  router.get(Paths.sessionExtension, deps.prereqMiddleware, extendSession);
  return router;
}

export {
	setupSessionController,
	extendSession
};
