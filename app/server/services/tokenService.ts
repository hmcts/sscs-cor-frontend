import { NextFunction, Request, Response } from 'express';
import { LoggerInstance } from 'winston';

const tribunalApiUrl = require('config').get('tribunals.api-url');
const request = require('superagent');
const HttpStatus = require('http-status-codes');
const { Logger } = require('@hmcts/nodejs-logging');

const logger: LoggerInstance = Logger.getLogger('TokenService.js');

export function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req?.params.mactoken) {
    const error = new Error(
      `Unable to make API call to ${tribunalApiUrl}/tokens/${req.params.mactoken}`
    );
    logger.error('No mactoken', error);
    next(error);
    return;
  }

  request
    .get(`${tribunalApiUrl}/tokens/${req.params.mactoken}`)
    .then((result) => {
      res.locals.token = result.body.token;
      logger.info(`GET /tokens/${req.params.mactoken} ${HttpStatus.OK}`);
      next();
    })
    .catch((error) => {
      if (error.statusCode === HttpStatus.BAD_REQUEST) {
        // Provide a better error message.
        error.message = error.rawResponse;
      }
      next(error);
    });
}
