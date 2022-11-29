import { Router, Router as expressRouter, Request, Response } from 'express';
import * as Paths from '../paths';
import { Dependencies } from '../routes';

export function supportEvidence(req: Request, res: Response): void {
  return res.render('help-guides/support-evidence.njk', { req });
}

export function setupSupportEvidenceController(deps: Dependencies): Router {
  const router = expressRouter();
  router.get(Paths.supportEvidence, deps.setLocals, supportEvidence);
  return router;
}

export function supportHearingExpenses(req: Request, res: Response): void {
  return res.render('help-guides/support-hearing-expenses.njk', { req });
}

export function setupSupportHearingExpensesController(
  deps: Dependencies
): Router {
  const router = expressRouter();
  router.get(
    Paths.supportHearingExpenses,
    deps.setLocals,
    supportHearingExpenses
  );
  return router;
}

export function supportHearing(req: Request, res: Response): void {
  res.render('help-guides/support-hearing.njk', { req });
}

export function setupSupportHearingController(deps: Dependencies): Router {
  const router = expressRouter();
  router.get(Paths.supportHearing, deps.setLocals, supportHearing);
  return router;
}

export function supportRepresentatives(req: Request, res: Response): void {
  res.render('help-guides/support-representatives.njk', { req });
}

export function setupSupportRepresentativesController(
  deps: Dependencies
): Router {
  const router = expressRouter();
  router.get(
    Paths.supportRepresentatives,
    deps.setLocals,
    supportRepresentatives
  );
  return router;
}

export function supportWithdrawAppeal(req: Request, res: Response): void {
  res.render('help-guides/support-withdraw-appeal.njk', { req });
}

export function setupSupportWithdrawAppealController(
  deps: Dependencies
): Router {
  const router = expressRouter();
  router.get(
    Paths.supportWithdrawAppeal,
    deps.setLocals,
    supportWithdrawAppeal
  );
  return router;
}
