const appInsights = require('app/server/app-insights');
const { Express } = require('@hmcts/nodejs-logging');
import nunjucks = require('nunjucks');
import express = require('express');
import { router as routes } from 'app/server/routes';
const errors = require('app/server/middleware/error-handler');
const health = require('app/server/middleware/health');
const locale = require('app/server/locale/en.json');
const paths = require('app/server/paths');
const bodyParser = require('body-parser');

const isDevelopment = process.env.NODE_ENV === 'development';

interface Options {
  disableAppInsights ?: boolean;
}

function setup(sessionHandler: any, options: Options) {
  const opts = options || {};
  if (!opts.disableAppInsights) {
    appInsights.enable();
  }

  const app = express();

  app.locals.i18n = locale;

  if (!isDevelopment) {
    app.set('trust proxy', 1);
  }

  nunjucks.configure([
    'app/views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use('/public', express.static(`${__dirname}/../../public`));

  app.use(Express.accessLogger());

  app.use(sessionHandler);
  app.use(paths.health, health.livenessCheck);
  app.use(paths.readiness, health.readinessCheck);
  app.use(errors.sessionNotFoundHandler);
  app.use(routes);
  app.use(errors.pageNotFoundHandler);
  app.use(errors.coreErrorHandler);

  return app;
}

export { setup };
