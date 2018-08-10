const appInsights = require('app-insights');
const { Express } = require('@hmcts/nodejs-logging');
const nunjucks = require('nunjucks');
const express = require('express');
const routes = require('app/routes');
const errors = require('app/middleware/error-handler');
const health = require('app/middleware/health');
const locale = require('app/locale/en.json');
const paths = require('paths');

const isDevelopment = process.env.NODE_ENV === 'development';

function setup(sessionHandler, options) {
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

  app.use('/public', express.static(`${__dirname}/public`));

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

module.exports = { setup };
