import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { TrackYourApealService } from '../services/tyaService';
import { dateFormat } from '../utils/dateUtils';

const logger = Logger.getLogger('outcome.js');

function getOutcome(req: Request, res: Response) {
  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const outcomes = session['appeal'].hearingOutcome;
  outcomes.forEach((outcome) => {
    logger.info(
      `Date converted from ${outcome.date} to ${dateFormat(
        outcome.date,
        'YYYY-MM-DD'
      )}`
    );
    outcome.date = dateFormat(outcome.date, 'YYYY-MM-DD');
  });
  return res.render('outcome-tab.njk', { outcomes });
}

function getDocument(trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    const pdf = await trackYourAppealService.getDocument(
      req.query.url as string,
      req
    );
    res.header('content-type', 'application/pdf');
    res.send(Buffer.from(pdf, 'binary'));
  };
}

function setupOutcomeController(deps: any) {
  const router = Router();
  router.get(Paths.outcome, deps.prereqMiddleware, getOutcome);
  router.get(
    Paths.document,
    deps.prereqMiddleware,
    getDocument(deps.trackYourApealService)
  );
  return router;
}

export { getOutcome, setupOutcomeController, getDocument };
