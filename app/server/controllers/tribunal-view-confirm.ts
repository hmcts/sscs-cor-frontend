import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';
import { CONST } from '../../constants';
import * as moment from 'moment';
import { tribunalViewAcceptedValidation } from '../utils/fieldValidation';

function getTribunalViewConfirm(req: Request, res: Response) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE) {
    return res.render('tribunal-view-confirm.html', {
      ft_welsh: req.session.featureToggles.ft_welsh
    });
  }
  return res.redirect(Paths.logout);
}

function postTribunalViewConfirm(hearingService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing: OnlineHearing = req.session.hearing;
    const acceptView = req.body['accept-view'];
    const validationMessage = tribunalViewAcceptedValidation(acceptView, true);
    if (validationMessage) {
      return res.render('tribunal-view-confirm.html', {
        error: validationMessage,
        ft_welsh: req.session.featureToggles.ft_welsh
      });
    }
    if (acceptView === 'yes') {
      try {
        await hearingService.recordTribunalViewResponse(
          hearing.online_hearing_id,
          CONST.DECISION_ACCEPTED_STATE,
          req
        );
        req.session.hearing.decision.appellant_reply = 'decision_accepted';
        req.session.hearing.decision.appellant_reply_datetime = moment.utc().format();
        return res.redirect(Paths.tribunalViewAccepted);
      } catch (error) {
        AppInsights.trackException(error);
        next(error);
      }
    } else if (acceptView === 'no') {
      return res.redirect(Paths.tribunalView);
    }
  };
}

function setupTribunalViewConfirmController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.tribunalViewConfirm, deps.prereqMiddleware, getTribunalViewConfirm);
  router.post(Paths.tribunalViewConfirm, deps.prereqMiddleware, postTribunalViewConfirm(deps.hearingService));
  return router;
}

export {
  setupTribunalViewConfirmController,
  getTribunalViewConfirm,
  postTribunalViewConfirm
};
