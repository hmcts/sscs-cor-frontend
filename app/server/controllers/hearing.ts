import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { Appeal, CaseDetails } from 'app/server/models/express-session';
import { Dependencies } from '../routes';
import { getHearingInfo, shouldShowHearing } from '../utils/hearingUtils';
import { LoggerInstance } from 'winston';

const logger: LoggerInstance = Logger.getLogger('hearing');

function getHearing(req: Request, res: Response): void {
  const session = req.session;

  if (!session) {
    const sessionError = new Error(
      'Unable to retrieve session from session store'
    );
    logger.error('MYA_SESSION_READ_FAIL', sessionError);
    AppInsights.trackException(sessionError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const appeal: Appeal = session.appeal;

  const attending: boolean = appeal.hearingType === 'oral';
  const showHearing = shouldShowHearing(appeal);
  const hearingInfo = showHearing ? getHearingInfo(appeal) : null;

  const caseDetails: CaseDetails = session.case;
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

function setupHearingController(deps: Dependencies): Router {
  const router = Router();
  router.get(Paths.hearing, deps.prereqMiddleware, getHearing);
  return router;
}

export { getHearing, setupHearingController };
