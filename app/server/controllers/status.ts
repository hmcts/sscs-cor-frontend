import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import { IAppealStage, getActiveStages } from '../utils/appealStages';
import { oralAppealStages, paperAppealStages, corAppealStages } from '../data/appealStages';

function getStatus(req: Request, res: Response) {
  if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) return res.render('errors/404.html');
  let stages: IAppealStage[] = [];
  if (req.session.appeal) {
    const { hearingType, status } = req.session.appeal;
    if (hearingType === 'oral') {
      stages = getActiveStages(status, oralAppealStages);
    } else if (hearingType === 'paper') {
      stages = getActiveStages(status, paperAppealStages);
    } else if (hearingType === 'cor') {
      stages = getActiveStages(status, corAppealStages);
    }
  }
  return res.render('status.html', { stages, appeal: req.session.appeal ? req.session.appeal : 'no appeal' });
}

function setupStatusController(deps: any) {
  const router = Router();
  router.get(Paths.status, deps.prereqMiddleware, getStatus);
  return router;
}

export {
  IAppealStage,
  getActiveStages,
  getStatus,
  setupStatusController
};
