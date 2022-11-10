import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getHearingsByName } from '../utils/fieldValidation';

const logger = Logger.getLogger('dormant-cases.js');

function getDormantCases(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const hearings = session['hearings']!;
  const dormantCases = hearings.filter(filterDormantCase);
  const dormantHearingsByName = getHearingsByName(dormantCases);
  return res.render('dormant-tab.njk', { dormantHearingsByName });
}

function filterDormantCase(selectedHearing, index, array) {
  return (
    selectedHearing.appeal_details.state === 'dormantAppealState' ||
    selectedHearing.appeal_details.state === 'voidState'
  );
}

function setupDormantCasesController(deps: any) {
  const router = Router();
  router.get(
    Paths.dormantCases,
    deps.prereqMiddleware,
    deps.setLocals,
    getDormantCases
  );
  return router;
}

export { getDormantCases, setupDormantCasesController };
