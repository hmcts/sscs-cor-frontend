import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { getHearingsByName } from '../utils/fieldValidation';

const logger = Logger.getLogger('active-cases.js');

function getActiveCases(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const hearings = session['hearings']!;
  const activeCases = hearings.filter(filterActiveCase);
  const activeHearingsByName = getHearingsByName(activeCases);
  return res.render('active-tab.njk', { activeHearingsByName });
}

function filterActiveCase(selectedHearing, index, array) {
  return !(
    selectedHearing.appeal_details.state === 'dormantAppealState' ||
    selectedHearing.appeal_details.state === 'voidState'
  );
}

function setupActiveCasesController(deps: any) {
  const router = Router();
  router.get(
    Paths.activeCases,
    deps.prereqMiddleware,
    deps.setLocals,
    getActiveCases
  );
  return router;
}

export { getActiveCases, setupActiveCasesController };
