import { Router } from 'express';
import * as config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';

const i18next = require('i18next');

const i18n = require('i18next');

const router = Router();

const languages: any = config.get('languages');

const logger: LoggerInstance = Logger.getLogger('app-configuration.ts');

router.get('*', async (req, res, next) => {
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
});

module.exports = router;
