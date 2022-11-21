import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getCasesByName } from '../utils/fieldValidation';
import { CaseDetails } from '../data/models';
import { Dependencies } from '../routes';
import { isCaseDormant } from './cases';

const logger = Logger.getLogger('dormant-cases');

export function getDormantCases(req: Request, res: Response): void {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const cases: Array<CaseDetails> = session.cases ? session.cases : [];
  const dormantCases = cases.filter(isCaseDormant);
  const dormantCasesByName: { [key: string]: Array<CaseDetails> } =
    getCasesByName(dormantCases);
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
