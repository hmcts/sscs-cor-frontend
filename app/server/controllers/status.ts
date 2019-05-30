import { Router, Request, Response } from 'express';
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
import { oralAppealStages, paperAppealStages } from '../data/appealStages';

interface IAppealStage {
  status: string;
  title: string;
  latestUpdateText: string;
  active?: boolean;
}

function getActiveStages(status: string, stages: IAppealStage[]) {
  const statusIdx = stages.findIndex(stage => stage.status === status);
  return stages.map((stage, idx) => {
    if (idx <= statusIdx) return { ...stage, active: true };
    else return { ...stage, active: false };
  });
}

function getStatus(req: Request, res: Response) {
  if (!isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) return res.render('errors/404.html');
  let stages = [];
  const { hearingType } = req.session.appeal;
  const { status } = req.session.appeal;
  if (hearingType === 'oral') {
    stages = getActiveStages(status, oralAppealStages);
  } else if (hearingType === 'paper') {
    stages = getActiveStages(status, paperAppealStages);
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
