import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { HearingService } from '../services/hearing';
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('active-cases.js');

function getActiveCases(req: Request, res: Response) {

  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error('Unable to retrieve session from session store');
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const hearingsByName = session['hearingsByName']!;

  return res.render('active-tab.html', { hearingsByName });
}

function setupActiveCasesController(deps: any) {
  const router = Router();
  router.get(Paths.activeCases, deps.prereqMiddleware, getActiveCases);
  return router;
}

export {
    getActiveCases,
    setupActiveCasesController
};
