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
import watch from './watch';

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
        '\'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU=\'',
        '\'sha256-OI6laJfMT/d/W+qGc6OUr8efvZ7nY/7JqW4FF3Xfq7w=\'',
        'www.google-analytics.com',
        'www.googletagmanager.com',
        'tagmanager.google.com'
      ],
      styleSrc: [
        '\'self\'',
        'tagmanager.google.com',
        'fonts.googleapis.com/'
      ],
      connectSrc: ['\'self\'', 'www.gov.uk'],
      mediaSrc: ['\'self\''],
      frameSrc: [
        '\'self\'',
        'www.googletagmanager.com'
      ],
      frameAncestors: [
        '\'self\'',
        'www.googletagmanager.com'
      ],
      imgSrc: [
        '\'self\'',
        '\'self\' data:',
        'www.google-analytics.com',
        'www.googletagmanager.com',
        'tagmanager.google.com'
      ]
    }
  }));

  // Helmet referrer policy
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  // Disallow search index indexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });

  app.locals.i18n = locale;
  app.locals.fileTypeWhiteList = fileTypes;

  if (!isDevelopment) {
    app.set('trust proxy', 1);
  } else {
    watch(app);
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
    const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/g;
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
