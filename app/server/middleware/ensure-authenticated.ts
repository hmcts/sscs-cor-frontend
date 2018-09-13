const { Logger } = require('@hmcts/nodejs-logging');
import { Paths } from 'app/server/paths';

const logger = Logger.getLogger('ensure-authenticated.js');

/* eslint-disable-next-line consistent-return */
function verifyOnlineHearingId(req, res, next) {
  const hearingId = req.session.hearing && req.session.hearing.online_hearing_id;
  if (hearingId) {
    return next();
  }
  const sessionId = req.session.id;
  req.session.destroy(error => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function setLocals(req, res, next) {
  res.locals.hearing = req.session.hearing;
  next();
}

const ensureAuthenticated = [verifyOnlineHearingId, setLocals];

export {
  verifyOnlineHearingId,
  setLocals,
  ensureAuthenticated
};
