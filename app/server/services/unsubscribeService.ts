import { NextFunction, Request, Response } from 'express';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import HttpStatus from 'http-status-codes';
import request from 'superagent';
import config from 'config';

const apiUrl: string = config.get('tribunals-api.url');

const logger: LoggerInstance = Logger.getLogger('UnsubscribeService');

export function changeEmailAddress(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = res.locals.token;

  const endpoint = `${apiUrl}/appeals/${token?.appealId}/subscriptions/${token?.subscriptionId}`;
  logger.info(`Calling API endpoint: ${endpoint}`);

  if (!token || !token.appealId || !token.subscriptionId) {
    logger.error(`Unable to make API call to POST: ${endpoint}`);
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

  const endpoint = `${apiUrl}/appeals/${token?.appealId}/subscriptions/${token?.subscriptionId}`;
  logger.info(`Calling API endpoint: ${endpoint}`);

  if (!token || !token.appealId || !token.subscriptionId) {
    logger.error(`Unable to make API call to POST: ${endpoint}`);
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
