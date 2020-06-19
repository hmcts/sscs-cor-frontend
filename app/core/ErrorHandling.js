/* eslint-disable no-unused-vars  */
const HttpStatus = require('http-status-codes');
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('ErrorHandling.js');

class ErrorHandling {
  static handle404(req, res, next) {
    const error = new Error(`Page Not Found - ${req.originalUrl}`);
    error.status = HttpStatus.NOT_FOUND;
    next(error);
  }

  static handleError(error, req, res, next) {
    const status = ErrorHandling.getStatus(error);
    logger.error('Unhandled error', error);
    res.status(status);
    res.render(status === HttpStatus.NOT_FOUND ? 'errors/404.html' : 'errors/500.html', {
      ft_welsh: req.session.featureToggles.ft_welsh
    });
  }

  static getStatus(error) {
    return error.status ||
           error.statusCode ||
           error.responseCode ||
           HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

module.exports = ErrorHandling;
