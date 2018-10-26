import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';
import { CONST } from '../../constants';
import { hearingWhyValidation } from '../utils/fieldValidation';
import * as moment from 'moment';

const getResponseDate = (appellantReplyDatetime?: string) => moment.utc(appellantReplyDatetime).add(6, 'weeks').format();

function getIndex(req: Request, res: Response) {
  const decisionViewExists: boolean = req.session.hearing.decision.decision_state === CONST.TRIBUNAL_VIEW_ISSUED_STATE;
  if (!decisionViewExists) {
    return res.redirect(Paths.logout);
  }
  const appellantRejected: boolean = req.session.hearing.decision && req.session.hearing.decision.appellant_reply === 'decision_rejected';
  let responseDate;
  if (appellantRejected) {
    const appellantReplyDatetime: string = req.session.hearing.decision && req.session.hearing.decision.appellant_reply_datetime;
    responseDate = getResponseDate(appellantReplyDatetime);
  }
  return res.render('hearing-why/index.html', { submitted: appellantRejected, responseDate });
}

function postIndex(tribunalViewService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const explainWhy: string = req.body[ 'explain-why' ];
    const validationMessage = hearingWhyValidation(explainWhy);

    if (validationMessage) return res.render('hearing-why/index.html', { error: validationMessage });

    try {
      const hearing: OnlineHearing = req.session.hearing;
      const responseDate = getResponseDate();
      await tribunalViewService.recordTribunalViewResponse(hearing.online_hearing_id, CONST.DECISION_REJECTED_STATE, explainWhy);
      req.session.hearing.decision.appellant_reply = 'decision_rejected';
      req.session.hearing.decision.appellant_reply_datetime = moment.utc().format();
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
