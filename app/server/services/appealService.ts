const { get } = require('lodash');
const apiUrl = require('config').get('tribunals.api-url');
const HttpStatus = require('http-status-codes');
const request = require('superagent');
import { Logger } from '@hmcts/nodejs-logging';

const logger = Logger.getLogger('AppealService.js');

const getAppeal = (req, res, next) => {
  if (!req.params.id) {
    next(new Error(`Unable to make API call to ${apiUrl}/appeals/${req.params.id}`));
    return;
  }

  request.get(`${apiUrl}/appeals/${req.params.id}`)
    .then(result => {
      const appeal = result.body.appeal;
      appeal.evidenceReceived = false;
      appeal.latestEvents = appeal.latestEvents || [];
      appeal.historicalEvents = appeal.historicalEvents || [];
      res.locals.appeal = appeal;
      logger.info(`GET /appeals/${req.params.id} ${HttpStatus.OK} for caseId ${appeal.caseId}`);
      next();
    }).catch(error => {
      if (error.status === HttpStatus.NOT_FOUND) {
        const message = get(error, 'response.body.message');
        const path = get(error, 'response.body.path');
        error.message = `${message} ${path}`;
      }
      // appInsights.trackException(error);
      next(error);
    });
};

const changeEmailAddress = (req, res, next) => {
  const token = res.locals.token;

  const endpoint = `${apiUrl}/appeals/${token.appealId}/subscriptions/${token.subscriptionId}`;

  if (!token || !token.appealId || !token.subscriptionId) {
    next(new Error(`Unable to make API call to POST: ${endpoint}`));
    return;
  }

  const body = { subscription: { email: req.body.email } };

  request.post(endpoint).send(body)
    .then(() => {
      logger.info(`POST ${endpoint} ${HttpStatus.OK}`);
      next();
    }).catch(error => {
      // appInsights.trackException(error);
      next(error);
    });
};

const stopReceivingEmails = (req, res, next) => {
  const token = res.locals.token;

  const endpoint = `${apiUrl}/appeals/${token.appealId}/subscriptions/${token.subscriptionId}`;

  if (!token || !token.appealId || !token.subscriptionId) {
    next(new Error(`Unable to make API call to DELETE: ${endpoint}`));
    return;
  }

  request.delete(endpoint)
    .then(() => {
      logger.info(`DELETE ${endpoint} ${HttpStatus.OK}`);
      next();
    }).catch(error => {
      // appInsights.trackException(error);
      next(error);
    });
};

module.exports = { getAppeal, changeEmailAddress, stopReceivingEmails };
