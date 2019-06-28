import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

function getHistory(req: Request, res: Response) {
  if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) return res.render('errors/404.html');
  return res.render('history.html', { appeal: req.session.appeal });
}

function setupHistoryController(deps: any) {
  const router = Router();
  router.get(Paths.history, deps.prereqMiddleware, getHistory);
  return router;
}

export {
  getHistory,
  setupHistoryController
};
