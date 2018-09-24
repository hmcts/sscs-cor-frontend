import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
import * as Hearing from 'app/server/services/hearing';

function getIndex(req: Request, res: Response) {
  return res.render('extend-deadline/index.html', { });
}

async function extensionConfirmation(req: Request, res: Response, next: NextFunction): Promise<void>    {

  const hearingId:string = req.session.hearing.online_hearing_id;
  const extend:string = req.body['extend-deadline'];

  if(!extend) return res.render('extend-deadline/index.html', { error: true });

  try {

    let deadline: string;

    if(extend === 'yes') {
      const response = await Hearing.updateDeadline(hearingId);
      deadline = response.deadline_expiry_date;
    } else {
      const response = await Hearing.get(hearingId);
      deadline = response.deadline_expiry_date;
    }

    res.render('extend-deadline/index.html', { extend: extend, deadline: deadline }); 
    
  } catch (error) {
    AppInsights.trackException(error);
    next(error);
  }

}

function setupExtendDeadlineController(deps: any): Router {
  const router = Router();
  router.get(Paths.extendDeadline, deps.ensureAuthenticated, getIndex);
  router.post(Paths.extendDeadline, deps.ensureAuthenticated, extensionConfirmation);
  return router;
}

export {
  setupExtendDeadlineController,
  extensionConfirmation,
  getIndex
};
