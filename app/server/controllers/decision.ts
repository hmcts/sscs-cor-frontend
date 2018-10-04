import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing'
import { CONST } from '../../constants'

function getDecision(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.DECISION_ISSUED_STATE) {
    return res.render('decision.html', { decision: hearing.decision });
  }
  return res.redirect(Paths.logout);
}

function setupDecisionController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.decision, deps.prereqMiddleware, getDecision);
  return router;
}

export {
  setupDecisionController,
  getDecision
};