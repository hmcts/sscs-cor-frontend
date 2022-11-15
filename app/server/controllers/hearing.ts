import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { CaseDetails } from '../services/cases';
import { Dependencies } from '../routes';

const logger = Logger.getLogger('hearing.js');

function getHearing(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const {
    latestEvents = [],
    historicalEvents = [],
    hearingType,
  } = session['appeal'];
  const attending: boolean = hearingType === 'oral';
  let hearingInfo = null;

  if (!session['hideHearing']) {
    hearingInfo = latestEvents.concat(historicalEvents).find((event) => {
      const { type } = event;
      if (type === 'HEARING_BOOKED' || type === 'NEW_HEARING_BOOKED')
        return event;
    });
  }

  let hearingArrangements = {};
  const appeal = session['appeal']!;
  const caseDetails: CaseDetails = session['case'];
  if (
    caseDetails &&
    !session['hideHearing'] &&
    caseDetails.hearing_arrangements
  ) {
    hearingArrangements = caseDetails.hearing_arrangements;
  }
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
