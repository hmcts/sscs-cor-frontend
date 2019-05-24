const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

const logger = Logger.getLogger('ensure-authenticated.js');

function checkAccessToken(req, res, next) {
  if (req.session.accessToken) {
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
  res.locals.showSignOut = true;
  res.locals.featureFlags = {};
  res.locals.featureFlags[Feature.MANAGE_YOUR_APPEAL] = isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL);
  next();
}

const ensureAuthenticated = [checkAccessToken, setLocals];

export {
  checkAccessToken,
  setLocals,
  ensureAuthenticated
};
