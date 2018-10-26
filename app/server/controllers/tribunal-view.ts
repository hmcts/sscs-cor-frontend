import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';
import { CONST } from '../../constants';
import * as moment from 'moment';
import { tribunalViewAcceptedValidation } from '../utils/fieldValidation';

function getRespondByDate(decisionStateDatetime: string): string {
  return moment.utc(decisionStateDatetime).add(7, 'day').format();
}

function getTribunalView(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE) {
    const respondBy = getRespondByDate(hearing.decision.decision_state_datetime);
    return res.render('tribunal-view.html', { decision: hearing.decision, respondBy });
  }
  return res.redirect(Paths.logout);
}

function postTribunalView(tribunalViewService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing: OnlineHearing = req.session.hearing;
    const acceptView = req.body['accept-view'];
    const validationMessage = tribunalViewAcceptedValidation(acceptView);
    if (validationMessage) {
      const respondBy = getRespondByDate(hearing.decision.decision_state_datetime);
      return res.render('tribunal-view.html', { decision: hearing.decision, respondBy, error: validationMessage });
    }
    if (acceptView === 'yes') {
      try {
        await tribunalViewService.recordTribunalViewResponse(hearing.online_hearing_id, CONST.DECISION_ACCEPTED_STATE);
        req.session.hearing.decision.appellant_reply = 'decision_accepted';
        req.session.hearing.decision.appellant_reply_datetime = moment.utc().format();
        return res.redirect(Paths.tribunalViewAccepted);
      } catch (error) {
        AppInsights.trackException(error);
        next(error);
      }
    }
    if (acceptView === 'no') {
      return res.redirect(Paths.hearingConfirm);
    }
  };
}

function setupTribunalViewController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.tribunalView, deps.prereqMiddleware, getTribunalView);
  router.post(Paths.tribunalView, deps.prereqMiddleware, postTribunalView(deps.tribunalViewService));
  return router;
}

export {
  setupTribunalViewController,
  getTribunalView,
  postTribunalView
};
