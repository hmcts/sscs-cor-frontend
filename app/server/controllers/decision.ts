import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';
import { CONST } from '../../constants';

function getDecision(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  const decisionStates = [CONST.DECISION_ACCEPTED_STATE, CONST.DECISION_REJECTED_STATE];
  if (hearing.decision && decisionStates.includes(hearing.decision.decision_state)) {
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
