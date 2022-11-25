import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { Dependencies } from '../routes';
import config from 'config';

const expireInSeconds: number = config.get('session.cookie.maxAgeInMs');

export interface ExtendSessionResponse {
  expireInSeconds?: number;
}

function extendSession(req: Request, res: Response): void {
  res.setHeader('Content-Type', 'application/json');
  const value: ExtendSessionResponse = { expireInSeconds };
  res.send(JSON.stringify(value));
}

function setupSessionController(deps: Dependencies): Router {
  const router = Router();
  router.get(Paths.sessionExtension, deps.prereqMiddleware, extendSession);
  return router;
}

export { setupSessionController, extendSession };
