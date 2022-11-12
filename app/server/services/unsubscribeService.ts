import { NextFunction, Request, Response } from 'express';

const apiUrl = require('config').get('tribunals.api-url');
const HttpStatus = require('http-status-codes');
const request = require('superagent');
const { Logger } = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('UnsubscribeService.js');

export function changeEmailAddress(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = res.locals.token;

  const endpoint = `${apiUrl}/appeals/${token.appealId}/subscriptions/${token.subscriptionId}`;

  if (!token || !token.appealId || !token.subscriptionId) {
    next(new Error(`Unable to make API call to POST: ${endpoint}`));
    return;
  }

  const body = { subscription: { email: req.body.email } };

  request
    .post(endpoint)
    .send(body)
    .then(() => {
      logger.info(`POST ${endpoint} ${HttpStatus.OK}`);
      next();
    })
    .catch((error) => {
      // appInsights.trackException(error);
      next(error);
    });
}

export function stopReceivingEmails(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = res.locals.token;

  const endpoint = `${apiUrl}/appeals/${token.appealId}/subscriptions/${token.subscriptionId}`;

  if (!token || !token.appealId || !token.subscriptionId) {
    next(new Error(`Unable to make API call to DELETE: ${endpoint}`));
    return;
  }

  request
    .delete(endpoint)
    .then(() => {
      logger.info(`DELETE ${endpoint} ${HttpStatus.OK}`);
      next();
    })
    .catch((error) => {
      // appInsights.trackException(error);
      next(error);
    });
}
