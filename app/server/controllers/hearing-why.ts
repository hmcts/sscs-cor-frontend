import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing';
import { CONST } from '../../constants';
import { hearingWhyValidation } from '../utils/fieldValidation';
import * as moment from 'moment';

function getIndex(req: Request, res: Response) {
  if (req.session.newHearingConfirmationThisSession) {
    return res.render('hearing-why/index.html', {});
  }
  return res.redirect(Paths.logout);
}

function postIndex(tribunalViewService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const explainWhy: string = req.body['explain-why'];
    const validationMessage = hearingWhyValidation(explainWhy);

    if (validationMessage) return res.render('hearing-why/index.html', { error: validationMessage });

    try {
      const hearing: OnlineHearing = req.session.hearing;
      const responseDate = moment.utc().add(6, 'week').format();
      await tribunalViewService.recordTribunalViewResponse(hearing.online_hearing_id, CONST.DECISION_REJECTED_STATE, explainWhy);
      return res.render('hearing-why/index.html', { submitted: true, hearing: req.session.hearing, responseDate });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupHearingWhyController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.hearingWhy, deps.prereqMiddleware, getIndex);
  router.post(Paths.hearingWhy, deps.prereqMiddleware, postIndex(deps.tribunalViewService));
  return router;
}

export {
  getIndex,
  postIndex,
  setupHearingWhyController
};
