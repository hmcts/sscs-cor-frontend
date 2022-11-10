import { Router, Request, Response } from 'express';
import * as Paths from '../paths';

function setupSupportEvidenceController(deps: any): Router {
  const router = Router();
  router.get(
    Paths.supportEvidence,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-evidence.njk', { req })
  );
  return router;
}

function setupSupportHearingExpensesController(deps: any): Router {
  const router = Router();
  router.get(
    Paths.supportHearingExpenses,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-hearing-expenses.njk', { req })
  );
  return router;
}

function setupSupportHearingController(deps: any): Router {
  const router = Router();
  router.get(
    Paths.supportHearing,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-hearing.njk', { req })
  );
  return router;
}

function setupSupportRepresentativesController(deps: any): Router {
  const router = Router();
  router.get(
    Paths.supportRepresentatives,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-representatives.njk', { req })
  );
  return router;
}

function setupSupportWithdrawAppealController(deps: any): Router {
  const router = Router();
  router.get(
    Paths.supportWithdrawAppeal,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-withdraw-appeal.njk', { req })
  );
  return router;
}

const supportControllers = {
  setupSupportEvidenceController,
  setupSupportHearingExpensesController,
  setupSupportHearingController,
  setupSupportRepresentativesController,
  setupSupportWithdrawAppealController,
};

export { supportControllers };
