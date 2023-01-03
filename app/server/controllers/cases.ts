import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByNameAndRow } from '../utils/fieldValidation';
import { Dependencies } from '../routes';
import { CaseDetails } from '../data/models';

const logger = Logger.getLogger('cases');

export function isCaseDormant(caseDetails: CaseDetails): boolean {
  const state = caseDetails.appeal_details.state;
  return state === 'dormantAppealState' || state === 'voidState';
}

export function isCaseActive(caseDetails: CaseDetails): boolean {
  return !isCaseDormant(caseDetails);
}

export function getCases(req: Request, res: Response): void {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const cases: Array<CaseDetails> = session.cases ? session.cases : [];
  const casesByNameAndRow = getCasesByNameAndRow(cases);
  return res.render('cases.njk', { casesByNameAndRow });
}

export function setupCasesController(deps: Dependencies): Router {
  const router = Router();
  router.get(Paths.selectCase, deps.prereqMiddleware, deps.setLocals, getCases);
  return router;
}
