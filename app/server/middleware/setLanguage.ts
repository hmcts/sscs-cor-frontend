import {
  Request,
  Response,
  NextFunction,
  Router as expressRouter,
} from 'express';
import * as config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';

import * as i18next from 'i18next';

const i18n = require('i18next');

const languages: any = config.get('languages');

const logger: LoggerInstance = Logger.getLogger('setLanguage');

export async function setLanguage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.session['language']) {
    req.session['language'] = 'en';
  } else if (req.query?.lng && languages.includes(req.query.lng)) {
    req.session['language'] = req.query.lng;
    await i18next.changeLanguage(req.query.lng as string);
  } else {
    await i18next.changeLanguage(req.session['language']);
  }
  logger.info(`Language is set to ${i18n.language}`);
  next();
}

export function setupSetLanguageController(): expressRouter {
  const router = expressRouter();
  router.get('*', setLanguage);
  return router;
}
