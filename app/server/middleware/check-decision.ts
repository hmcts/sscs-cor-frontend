import { NextFunction, Request, Response } from 'express'
const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from 'app/server/paths';
import { OnlineHearing } from 'app/server/services/getOnlineHearing'
import { CONST } from 'app/constants'

const logger = Logger.getLogger('check-decision.js');

export function checkDecision(req: Request, res: Response, next: NextFunction) {
  const hearing: OnlineHearing = req.session.hearing;
  if (hearing.decision && hearing.decision.decision_state === CONST.DECISION_ISSUED_STATE) {
    logger.info(`Disallowing request for ${req.path} due to decision issued, redirecting to ${Paths.decision}`);
    return res.redirect(Paths.decision)
  }
  return next();
}
