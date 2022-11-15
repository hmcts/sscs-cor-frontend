import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { Dependencies } from '../routes';

export function setupSupportEvidenceController(deps: Dependencies): Router {
  const router = Router();
  router.get(
    Paths.supportEvidence,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-evidence.njk', { req })
  );
  return router;
}

export function setupSupportHearingExpensesController(
  deps: Dependencies
): Router {
  const router = Router();
  router.get(
    Paths.supportHearingExpenses,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-hearing-expenses.njk', { req })
  );
  return router;
}

export function setupSupportHearingController(deps: Dependencies): Router {
  const router = Router();
  router.get(
    Paths.supportHearing,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-hearing.njk', { req })
  );
  return router;
}

export function setupSupportRepresentativesController(
  deps: Dependencies
): Router {
  const router = Router();
  router.get(
    Paths.supportRepresentatives,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-representatives.njk', { req })
  );
  return router;
}

export function setupSupportWithdrawAppealController(
  deps: Dependencies
): Router {
  const router = Router();
  router.get(
    Paths.supportWithdrawAppeal,
    deps.setLocals,
    (req: Request, res: Response) =>
      res.render('help-guides/support-withdraw-appeal.njk', { req })
  );
  return router;
}
