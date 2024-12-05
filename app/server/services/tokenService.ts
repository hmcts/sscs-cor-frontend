import { NextFunction, Request, Response } from 'express';
import { LoggerInstance } from 'winston';
import config from 'config';
import { OK, BAD_REQUEST } from 'http-status-codes';
import { Logger } from '@hmcts/nodejs-logging';
import request from 'superagent';

const apiUrl = config.get('tribunals-api.url');
const logger: LoggerInstance = Logger.getLogger('TokenService.js');

export function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const mactoken = req.params.mactoken;
  if (!mactoken) {
    const error = new Error(
      `Unable to make API call to ${apiUrl}/tokens/${mactoken}`
    );
    logger.error('No mactoken', error);
    next(error);
    return;
  }

  request
    .get(`${apiUrl}/tokens/${mactoken}`)
    .then((result) => {
      res.locals.token = result.body.token;
      logger.info(`GET /tokens/${mactoken} ${OK}`);
      next();
    })
    .catch((error) => {
      if (error.statusCode === BAD_REQUEST) {
        // Provide a better error message.
        error.message = error.rawResponse;
      }
      next(error);
    });
}
