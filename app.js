const appInsights = require('app-insights');
const { Express } = require('@hmcts/nodejs-logging');
const nunjucks = require('nunjucks');
const express = require('express');
const routes = require('app/routes');
const { pageNotFoundHandler, coreErrorHandler } = require('app/middleware/error-handler');
const locale = require('app/locale/en.json');

function setup(options) {
  const opts = options || {};
  if (!opts.disableAppInsights) {
    appInsights.enable();
  }

  const app = express();

  nunjucks.configure([
    'app/views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });

  app.use(Express.accessLogger());

  app.use('/public', express.static(`${__dirname}/public`));
  app.use('/', routes);
  app.use(pageNotFoundHandler);
  app.use(coreErrorHandler);

  app.locals.i18n = locale;

  return app;
}

module.exports = { setup };
