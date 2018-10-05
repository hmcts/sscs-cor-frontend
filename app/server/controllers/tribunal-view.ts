import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing';
import { CONST } from '../../constants'
import * as moment from 'moment';

function getTribunalView(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE) {
    const respondBy = moment.utc(hearing.decision.decision_state_datetime).add(7, 'day').format();
    return res.render('tribunal-view.html', { decision: hearing.decision, respondBy });
  }
  return res.redirect(Paths.logout);
}

function setupTribunalViewController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.tribunalView, deps.prereqMiddleware, getTribunalView);
  return router;
}

export {
  setupTribunalViewController,
  getTribunalView
};