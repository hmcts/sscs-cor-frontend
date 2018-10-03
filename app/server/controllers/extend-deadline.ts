import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';

function getIndex(req: Request, res: Response) {
  return res.render('extend-deadline/index.html', {
    hearing: req.session.hearing
  });
}

function extensionConfirmation(extendDeadlineService: any) {

  return async (req: Request, res: Response, next: NextFunction) => {

    const hearingId: string = req.session.hearing.online_hearing_id;
    const extend: string = req.body['extend-deadline'];

    if (!extend) return res.render('extend-deadline/index.html', { error: true });

    try {
      
      if (extend === 'yes') {
        const response = await extendDeadlineService(hearingId);
        req.session.hearing.deadline = response.deadline_expiry_date;
      }
      
      res.render('extend-deadline/index.html', { extend: extend, deadline: req.session.hearing.deadline });

    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  }
}

function setupExtendDeadlineController(deps: any): Router {
  const router = Router();
  router.get(Paths.extendDeadline, deps.prereqMiddleware, getIndex);
  router.post(Paths.extendDeadline, deps.prereqMiddleware, extensionConfirmation(deps.extendDeadlineService));
  return router;
}

export {
  setupExtendDeadlineController,
  extensionConfirmation,
  getIndex
};
