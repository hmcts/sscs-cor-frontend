import * as AppInsights from './app-insights';
const { Express } = require('@hmcts/nodejs-logging');
import { RequestHandler } from 'express';
import express = require('express');
import { router as routes } from './routes';
const errors = require('./middleware/error-handler');
import * as health from './middleware/health';
const locale = require('../../locale/en.json');
import * as Paths from './paths';
const bodyParser = require('body-parser');
import * as cookieParser from 'cookie-parser';

const { fileTypes } = require('./utils/mimeTypeWhitelist');

import { configureHelmet, configureHeaders, configureNunjucks } from './app-configurations';

import watch from './watch';

const isDevelopment = process.env.NODE_ENV === 'development';

interface Options {
  disableAppInsights ?: boolean;
}

function setup(sessionHandler: RequestHandler, options: Options) {
  const opts = options || {};
  if (!opts.disableAppInsights) {
    AppInsights.enable();
  }

  const app = express();

  configureHeaders(app);

  app.locals.i18n = locale;
  app.locals.fileTypeWhiteList = fileTypes;

  configureHelmet(app);

  if (!isDevelopment) {
    app.set('trust proxy', 1);
    // Protect against some well known web vulnerabilities

  } else {
    watch(app);
    app.locals.isDev = true;
  }

  configureNunjucks(app);

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());

  app.use('/public', express.static(`${__dirname}/../../public`));

  app.use(Express.accessLogger());

  app.use(sessionHandler);
  app.use(Paths.health, health.livenessCheck);
  app.use(Paths.readiness, health.readinessCheck);
  app.use(errors.sessionNotFoundHandler);
  app.use(routes);
  app.use(errors.pageNotFoundHandler);
  app.use(errors.coreErrorHandler);

  return app;
}

export { setup };
