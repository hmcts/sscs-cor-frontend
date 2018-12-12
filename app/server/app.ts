import { CONST } from '../constants';
import * as AppInsights from './app-insights';
const { Express } = require('@hmcts/nodejs-logging');
import { RequestHandler } from 'express';
import nunjucks = require('nunjucks');
import express = require('express');
import { router as routes } from './routes';
const errors = require('./middleware/error-handler');
import * as health from './middleware/health';
const locale = require('../../locale/en.json');
import * as Paths from './paths';
const bodyParser = require('body-parser');
import * as cookieParser from 'cookie-parser';
import * as moment from 'moment';
const { fileTypes } = require('./utils/mimeTypeWhitelist');
const dateFilter = require('nunjucks-date-filter');
const helmet = require('helmet');
const os = require('os');

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

  // Protect against some well known web vulnerabilities
  // by setting HTTP headers appropriately.
  app.use(helmet());

  // Helmet content security policy (CSP) to allow only assets from same domain.
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ['\'self\''],
      fontSrc: ['\'self\' data:'],
      scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'www.google-analytics.com',
        'www.googletagmanager.com'
      ],
      connectSrc: ['\'self\'', 'www.gov.uk'],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\''],
      imgSrc: [
        '\'self\'',
        'www.google-analytics.com',
        'www.googletagmanager.com'
      ]
    }
  }));

  // Helmet referrer policy
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  // Disallow search index indexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them
    res.setHeader('X-Robots-Tag', 'noindex');
    res.setHeader('X-Served-By', os.hostname());
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
    next();
  });

  app.locals.i18n = locale;
  app.locals.fileTypeWhiteList = fileTypes;

  if (!isDevelopment) {
    app.set('trust proxy', 1);
  }

  const nunEnv = nunjucks.configure([
    'views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });
  nunEnv.addFilter('date', function(text) {
    if (!text) return '';
    const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/;
    return text.replace(isoDateRegex, (date) => moment.utc(date).format(CONST.DATE_FORMAT));
  });
  nunEnv.addFilter('eval', function(text) {
    return nunjucks.renderString(text, this.ctx);
  });

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
