import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

function getHistory(req: Request, res: Response) {
  if (!isFeatureEnabled(Feature.HISTORY_TAB, req.cookies))
    return res.render('errors/404.njk');
  const { latestEvents, historicalEvents } = req.session['appeal'];
  const events = latestEvents.concat(
    Array.isArray(historicalEvents) ? historicalEvents : []
  );

  return res.render('history.njk', { events, appeal: req.session['appeal'] });
}

function setupHistoryController(deps: any) {
  const router = Router();
  router.get(Paths.history, deps.prereqMiddleware, getHistory);
  return router;
}

export { getHistory, setupHistoryController };
