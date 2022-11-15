import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByName } from '../utils/fieldValidation';
import { CaseDetails } from '../services/cases';
import { Dependencies } from '../routes';

const logger = Logger.getLogger('active-cases.js');

function filterActiveCase(selectedHearing, index, array): boolean {
  return !(
    selectedHearing.appeal_details.state === 'dormantAppealState' ||
    selectedHearing.appeal_details.state === 'voidState'
  );
}

export function getActiveCases(req: Request, res: Response): void {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const cases: Array<CaseDetails> = session['cases']
    ? new Array<CaseDetails>()
    : session['cases'];
  const activeCases = cases.filter(filterActiveCase);
  const activeCasesByName = getCasesByName(activeCases);
  return res.render('active-tab.njk', { activeCasesByName });
}

export function setupActiveCasesController(deps: Dependencies): Router {
  const router = Router();
  router.get(
    Paths.activeCases,
    deps.prereqMiddleware,
    deps.setLocals,
    getActiveCases
  );
  return router;
}
