const { Logger } = require('@hmcts/nodejs-logging');
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');

const logger = Logger.getLogger('error-handler.js');

function pageNotFoundHandler(req, res) {
  res.status(NOT_FOUND);
  res.render('errors/404.html');
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
  res.status(INTERNAL_SERVER_ERROR);
  res.render('errors/500.html');
}
/* eslint-enable no-unused-vars */

module.exports = { pageNotFoundHandler, coreErrorHandler, sessionNotFoundHandler };