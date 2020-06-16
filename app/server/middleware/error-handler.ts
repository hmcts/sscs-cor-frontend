const { Logger } = require('@hmcts/nodejs-logging');
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
import * as AppInsights from '../app-insights';

const logger = Logger.getLogger('error-handler.js');

function pageNotFoundHandler(req, res) {
  res.status(NOT_FOUND);
  res.render('errors/404.html', { ft_welsh: req.session.featureToggles.ft_welsh });
}

function sessionNotFoundHandler(req, res, next) {
  if (!req.session) {
    return next('Session not found');
  }
  return next();
}

/* eslint-disable no-unused-vars */
function coreErrorHandler(error, req, res, next) {
  logger.error(`500 Error from request ${req.originalUrl} : ${JSON.stringify(error)} : ${error}`);
  AppInsights.trackException(error);
  res.status(INTERNAL_SERVER_ERROR);
  res.render('errors/500.html', { ft_welsh: req.session.featureToggles.ft_welsh });
}
/* eslint-enable no-unused-vars */

export { pageNotFoundHandler, coreErrorHandler, sessionNotFoundHandler };
