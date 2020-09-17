import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';

function getHearing(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error('Unable to retrieve session from session store');
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies) || session.appeal.hearingType === 'cor') return res.render('errors/404.html');

  const { latestEvents = [], historicalEvents = [], hearingType, status } = session.appeal;
  const attending: boolean = hearingType === 'oral';
  const showHearing: boolean = status !== 'RESPONSE_RECEIVED';
  let hearingInfo = null;

  if (showHearing) {
    hearingInfo = latestEvents.concat(historicalEvents).find(event => {
      const { type } = event;
      if (type === 'HEARING_BOOKED' || type === 'NEW_HEARING_BOOKED') return event;
    });
  }

  let hearingArrangements = {};

  if (session.hearing && showHearing && session.hearing.hearing_arrangements) {
    hearingArrangements = session.hearing.hearing_arrangements;
  }
  return res.render('hearing-tab.html', { hearingInfo, attending, hearingArrangements });
}

function setupHearingController(deps: any) {
  const router = Router();
  router.get(Paths.hearing, deps.prereqMiddleware, getHearing);
  return router;
}

export {
  getHearing,
  setupHearingController
};
