const { Logger } = require('@hmcts/nodejs-logging');
const paths = require('paths');

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
    return res.redirect(paths.login);
  });
}

function setLocals(req, res, next) {
  res.locals.hearing = req.session.hearing;
  next();
}

module.exports = {
  verifyOnlineHearingId,
  setLocals,
  ensureAuthenticated: [verifyOnlineHearingId, setLocals]
};
