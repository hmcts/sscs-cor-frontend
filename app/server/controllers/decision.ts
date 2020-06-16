import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';

function getDecision(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.has_final_decision) {
    return res.render('decision.html', { decision: hearing.decision, final_decision: hearing.final_decision.reason, ft_welsh: req.session.featureToggles.ft_welsh });
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
