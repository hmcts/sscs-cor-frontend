import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing';
import { CONST } from '../../constants'

function getTribunalView(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE) {
    return res.render('tribunal-view.html', { decision: hearing.decision });
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