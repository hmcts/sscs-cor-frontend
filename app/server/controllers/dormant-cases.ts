import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { HearingService } from '../services/hearing';
import { getActiveCases } from './active-cases';

const logger = Logger.getLogger('dormant-cases.js');

function getDormantCases(req: Request, res: Response) {

  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error('Unable to retrieve session from session store');
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const hearingsByName = session['hearingsByName']!;

  const dormantCases = hearingsByName.filter(filterDormantCase);

  return res.render('dormant-tab.html', { dormantCases });
}

function filterDormantCase(selectedHearing) {
  return selectedHearing.appeal_details.state === 'dormantAppealState' || selectedHearing.appeal_details.state === 'voidState';
}

function setupDormantCasesController(deps: any) {
  const router = Router();
  router.get(Paths.dormantCases, deps.prereqMiddleware, getDormantCases);
  return router;
}

export {
    getDormantCases,
    setupDormantCasesController
};
