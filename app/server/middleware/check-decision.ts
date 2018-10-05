import { NextFunction, Request, Response } from 'express'
const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing'
import { CONST } from '../../constants'

const logger = Logger.getLogger('check-decision.js');

const decisionStateRedirectMap = {};
decisionStateRedirectMap[CONST.TRIBUNAL_VIEW_ISSUED_STATE] = Paths.tribunalView;
decisionStateRedirectMap[CONST.DECISION_ACCEPTED_STATE] = Paths.decision;
decisionStateRedirectMap[CONST.DECISION_REJECTED_STATE] = Paths.decision;

export function checkDecision(req: Request, res: Response, next: NextFunction) {
  const hearing: OnlineHearing = req.session.hearing;
  const decisionState = hearing.decision && hearing.decision.decision_state;
  const redirectTo = decisionStateRedirectMap[decisionState];
  if (decisionState && redirectTo) {
    logger.info(`Disallowing request for ${req.path} due to decision state ${decisionState}, redirecting to ${redirectTo}`);
    return res.redirect(redirectTo);
  }
  return next();
}
