import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByName } from '../utils/fieldValidation';
import { CaseDetails } from '../services/cases';
import { Dependencies } from '../routes';

const logger = Logger.getLogger('dormant-cases.js');

function filterDormantCase(selectedHearing, index, array): boolean {
  return (
    selectedHearing.appeal_details.state === 'dormantAppealState' ||
    selectedHearing.appeal_details.state === 'voidState'
  );
}

export function getDormantCases(req: Request, res: Response): void {
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
  const dormantCases = cases.filter(filterDormantCase);
  const dormantCasesByName = getCasesByName(dormantCases);
  return res.render('dormant-tab.njk', { dormantCasesByName });
}

export function setupDormantCasesController(deps: Dependencies): Router {
  const router = Router();
  router.get(
    Paths.dormantCases,
    deps.prereqMiddleware,
    deps.setLocals,
    getDormantCases
  );
  return router;
}
