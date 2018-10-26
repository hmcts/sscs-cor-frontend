import { NextFunction, Request, Response } from 'express';
const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from '../paths';
import { OnlineHearing } from '../services/hearing';
import { CONST } from '../../constants';

const logger = Logger.getLogger('check-decision.js');
const acceptedDecisionStates = [CONST.TRIBUNAL_VIEW_ISSUED_STATE, CONST.DECISION_REJECTED_STATE, CONST.DECISION_ACCEPTED_STATE];

export function checkDecision(req: Request, res: Response, next: NextFunction) {
  const hearing: OnlineHearing = req.session.hearing;
  const decisionState = hearing.decision && hearing.decision.decision_state;
  if (!acceptedDecisionStates.includes(decisionState)) {
    return next();
  }
  logger.info(`Disallowing request for ${req.path} due to decision state ${decisionState}`);
  if (decisionState === CONST.TRIBUNAL_VIEW_ISSUED_STATE) {
    const appellantReply = hearing.decision.appellant_reply;
    if (appellantReply === 'decision_accepted') {
      return res.redirect(Paths.tribunalViewAccepted);
    }
    if (appellantReply === 'decision_rejected') {
      return res.redirect(Paths.hearingWhy);
    }
    return res.redirect(Paths.tribunalView);
  }
  return res.redirect(Paths.decision);
}
