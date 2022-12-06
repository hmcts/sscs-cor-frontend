import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { CaseDetails } from 'app/server/models/express-session';
import { Dependencies } from '../routes';

export function getDecision(req: Request, res: Response): void {
  const caseDetails: CaseDetails = req.session.case;
  if (caseDetails.has_final_decision) {
    return res.render('decision.njk', {
      decision: caseDetails.decision,
      final_decision: caseDetails.final_decision.reason,
    });
  }
  return res.redirect(Paths.logout);
}

export function setupDecisionController(deps: Dependencies): Router {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.decision, deps.prereqMiddleware, getDecision);
  return router;
}
