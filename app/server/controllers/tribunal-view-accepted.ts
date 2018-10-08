import { Router, Request, Response } from 'express';
import * as moment from 'moment';
import * as Paths from '../paths';

function getTribunalViewAccepted(req: Request, res: Response) {
  if (req.session.tribunalViewAcceptedThisSession) {
    const nextCorrespondenceDate = moment().utc().add(14, 'days').format();
    return res.render('tribunal-view-accepted.html', { nextCorrespondenceDate });
  }
  return res.redirect(Paths.taskList);
}

function setupTribunalViewAcceptedController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.tribunalViewAccepted, deps.prereqMiddleware, getTribunalViewAccepted);
  return router;
}

export {
  setupTribunalViewAcceptedController,
  getTribunalViewAccepted
};