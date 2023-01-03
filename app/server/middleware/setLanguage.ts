import {
  Request,
  Response,
  NextFunction,
  Router as expressRouter,
} from 'express';
import * as config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import { resolveQuery } from '../utils/parseUtils';

import * as i18next from 'i18next';

const i18n = require('i18next');

const languages: Array<string> = config.get('languages');

const logger: LoggerInstance = Logger.getLogger('setLanguage');

export async function setLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const queryLng = resolveQuery(req.query?.lng);
  const sessionLanguage = req.session.language;
  if (!sessionLanguage) {
    req.session.language = 'en';
  } else if (queryLng && languages.includes(queryLng)) {
    req.session.language = queryLng;
    await i18next.changeLanguage(queryLng);
  } else {
    await i18next.changeLanguage(sessionLanguage);
  }
  logger.info(`Language is set to ${i18n.language}`);
  next();
}

export function setupSetLanguageController(): expressRouter {
  const router = expressRouter();
  router.get('*', setLanguage);
  return router;
}
