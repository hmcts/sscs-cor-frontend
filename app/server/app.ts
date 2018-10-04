import { CONST } from '../constants';
import * as AppInsights from './app-insights';
const { Express } = require('@hmcts/nodejs-logging');
import { RequestHandler } from "express";
import nunjucks = require('nunjucks');
import express = require('express');
import { router as routes } from './routes';
const errors = require('./middleware/error-handler');
const health = require('./middleware/health');
const locale = require('../../locale/en.json');
import * as Paths from './paths';
const bodyParser = require('body-parser');
import * as moment from 'moment';

var dateFilter = require('nunjucks-date-filter');
dateFilter.setDefaultFormat(CONST.DATE_FORMAT);

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

  app.locals.i18n = locale;

  if (!isDevelopment) {
    app.set('trust proxy', 1);
  }

  var nunEnv = nunjucks.configure([
    'views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });
  nunEnv.addFilter('date', function(text) {
    if(!text) return '';
    const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
    return  text.replace(isoDateRegex, (date) => moment.utc(date).format(CONST.DATE_FORMAT));
  });
  nunEnv.addFilter('eval', function(text) {
    return  nunjucks.renderString(text, this.ctx);
  });

  app.use(bodyParser.urlencoded({
    extended: true
  }));

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
