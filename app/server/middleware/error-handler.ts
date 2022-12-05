import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction } from 'express';
import HttpException from '../exceptions/HttpException';
import {
  BAD_REQUEST,
  FORBIDDEN,
  GATEWAY_TIMEOUT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status-codes';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';

const i18next = require('i18next');
const content = require('../../../locale/content');

const logger: LoggerInstance = Logger.getLogger('error-handler.js');

function trackTrace(error: HttpException, req: Request) {
  logger.error(
    `${error.status} Error from request ${req.originalUrl}, error: ${error}`
  );
  AppInsights.trackTrace(error);
}

function trackException(error: HttpException, req: Request) {
  logger.error(
    `${error?.status} Error from request ${req.originalUrl}, error: ${error}`
  );
  AppInsights.trackException(error);
}

export function sessionNotFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session) {
    return next('Session not found');
  }
  return next();
}

export function pageNotFoundHandler(req: Request, res: Response): void {
  logger.error(`${NOT_FOUND} Error from request ${req.originalUrl}`);
  res.status(NOT_FOUND);
  const header: string = content[i18next.language].error.error404.header;
  res.render('errors/error.njk', { header });
}

export function forbiddenHandler(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.status !== FORBIDDEN) {
    return next(error);
  }
  trackTrace(error, req);
  res.status(error.status);
  const header: string = content[i18next.language].error.error403.header;
  res.render('errors/error.njk', { header });
}

export function badRequestHandler(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.status !== BAD_REQUEST) {
    return next(error);
  }
  trackTrace(error, req);
  res.status(error.status);
  const header: string = content[i18next.language].error.error400.header;
  res.render('errors/error.njk', { header });
}

export function gatewayTimeoutHandler(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.status !== GATEWAY_TIMEOUT) {
    return next(error);
  }
  trackTrace(error, req);
  res.status(error.status);
  const header: string = content[i18next.language].error.error504.header;
  const messages: Array<string> = [];
  messages.push(content[i18next.language].error.error504.content);
  messages.push(content[i18next.language].common.contactIfProblemContinues);
  res.render('errors/error.njk', { header, messages });
}

export function coreErrorHandler(
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  trackException(error, req);
  res.status(INTERNAL_SERVER_ERROR);
  const header: string = content[i18next.language].error.error500.header;
  const messages: Array<string> = [];
  messages.push(content[i18next.language].error.error500.content);
  messages.push(content[i18next.language].common.contactIfProblemContinues);
  res.render('errors/error.njk', { header, messages });
}
