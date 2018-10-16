import { Router, Request, Response } from 'express';
import * as moment from 'moment';
import * as Paths from '../paths';

function getTribunalViewAccepted(req: Request, res: Response) {
  const appellantAccepted: boolean = req.session.hearing.decision && req.session.hearing.decision.appellant_reply === 'decision_accepted';
  if (appellantAccepted) {
    const appellantReplyDatetime: string = req.session.hearing.decision && req.session.hearing.decision.appellant_reply_datetime;
    const nextCorrespondenceDate = moment.utc(appellantReplyDatetime).add(14, 'days').format();
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
