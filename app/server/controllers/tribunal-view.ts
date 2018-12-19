import { Router, Request, Response, NextFunction } from 'express';
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

    const startDate = moment.utc(hearing.decision.start_date).format();
    const endDate = moment.utc(hearing.decision.end_date).format();

    return res.render('tribunal-view.html', { decision: hearing.decision, respondBy, startDate, endDate });
  }
  return res.redirect(Paths.logout);
}

function postTribunalView(hearingService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing: OnlineHearing = req.session.hearing;
    const acceptView = req.body['accept-view'];
    const validationMessage = tribunalViewAcceptedValidation(acceptView);
    if (validationMessage) {
      const respondBy = getRespondByDate(hearing.decision.decision_state_datetime);
      return res.render('tribunal-view.html', { decision: hearing.decision, respondBy, error: validationMessage });
    }
    if (acceptView === 'yes') {
      return res.redirect(Paths.tribunalViewConfirm);
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
  router.post(Paths.tribunalView, deps.prereqMiddleware, postTribunalView(deps.hearingService));
  return router;
}

export {
  setupTribunalViewController,
  getTribunalView,
  postTribunalView
};
