import { Router, Request, Response } from 'express';
import { Logger } from '@hmcts/nodejs-logging';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import { IAppealStage, getActiveStages } from '../utils/appealStages';
import { oralAppealStages, paperAppealStages, corAppealStages, closedAppealStages } from '../data/appealStages';
import { HearingService } from '../services/hearing';
import * as rp from 'request-promise';

const logger = Logger.getLogger('login.js');

function getStatus(hearingService: HearingService) {
  return async (req: Request, res: Response) => {
    if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) return res.render('errors/404.html');
    let stages: IAppealStage[] = [];
    const { appeal } = req.session;
    const noProgressBarStages = ['CLOSED', 'LAPSED_REVISED', 'WITHDRAWN'];
    const { hearingType, status } = appeal;
    if (!noProgressBarStages.includes(status)) {
      if (hearingType === 'oral') {
        stages = getActiveStages(status, oralAppealStages);
      } else if (hearingType === 'paper') {
        stages = getActiveStages(status, paperAppealStages);
      } else if (hearingType === 'cor') {
        stages = getActiveStages(status, corAppealStages);
      }
    } else {
      stages = getActiveStages(status, closedAppealStages);
    }
    if (appeal && appeal.caseId) {
      logger.info('Logging time for case id ' + appeal.caseId);
      const { statusCode }: rp.Response = await hearingService.logUserLoggedInTimeWithCase(appeal.caseId, req);
    }
    return res.render('status-tab.html', { stages, appeal });
  };
}

function setupStatusController(deps: any) {
  const router = Router();
  router.get(Paths.status, deps.prereqMiddleware, getStatus(deps.hearingService));
  return router;
}

export {
  getStatus,
  setupStatusController
};
