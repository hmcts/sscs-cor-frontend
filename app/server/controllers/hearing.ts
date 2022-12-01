import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { CaseDetails } from '../services/cases';
import { Dependencies } from '../routes';
import { getHearingInfo, shouldShowHearing } from '../utils/hearingUtils';
import { LoggerInstance } from 'winston';

const logger: LoggerInstance = Logger.getLogger('hearing');

function getHearing(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const appeal = session['appeal'];

  const attending: boolean = appeal.hearingType === 'oral';
  const showHearing = shouldShowHearing(appeal);
  const hearingInfo = showHearing ? getHearingInfo(appeal) : null;

  const caseDetails: CaseDetails = session['case'];
  const hearingArrangements =
    showHearing && caseDetails?.hearing_arrangements
      ? caseDetails.hearing_arrangements
      : {};

  return res.render('hearing-tab.njk', {
    hearingInfo,
    attending,
    hearingArrangements,
    appeal,
  });
}

function setupHearingController(deps: Dependencies) {
  const router = Router();
  router.get(Paths.hearing, deps.prereqMiddleware, getHearing);
  return router;
}

export { getHearing, setupHearingController };
