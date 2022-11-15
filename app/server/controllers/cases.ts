import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByName } from '../utils/fieldValidation';
import { Dependencies } from '../routes';

const logger = Logger.getLogger('active-cases.js');

export function getCases(req: Request, res: Response): void {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const cases = session['cases'] ? {} : session['cases'];
  const casesByName = getCasesByName(cases);
  return res.render('cases.njk', { casesByName });
}

export function setupCasesController(deps: Dependencies): Router {
  const router = Router();
  router.get(Paths.selectCase, deps.prereqMiddleware, deps.setLocals, getCases);
  return router;
}
