import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import { IAppealStage, getActiveStages } from '../utils/appealStages';
import {
  oralAppealStages,
  paperAppealStages,
  corAppealStages,
  closedAppealStages,
} from '../data/appealStages';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('status.js');

function getStatus(req: Request, res: Response) {
  let stages: IAppealStage[] = [];

  const session = req.session;

  if (!session) {
    const missingCaseIdError = new Error(
      'Unable to retrieve session from session store'
    );
    AppInsights.trackException(missingCaseIdError);
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }

  const appeal = session['appeal']!;

  const noProgressBarStages = ['CLOSED', 'LAPSED_REVISED', 'WITHDRAWN'];
  const { hearingType, status } = appeal;
  if (noProgressBarStages.includes(status)) {
    stages = getActiveStages(status, closedAppealStages);
  } else if (hearingType === 'oral') {
    stages = getActiveStages(status, oralAppealStages);
  } else if (hearingType === 'paper') {
    stages = getActiveStages(status, paperAppealStages);
  } else if (hearingType === 'cor') {
    stages = getActiveStages(status, corAppealStages);
  }
  return res.render('status-tab.njk', { stages, appeal });
}

function setupStatusController(deps: any) {
  const router = Router();
  router.get(Paths.status, deps.prereqMiddleware, getStatus);
  return router;
}

export { getStatus, setupStatusController };
