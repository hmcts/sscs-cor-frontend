const helmet = require('helmet');
import { CONST } from '../constants';
import nunjucks = require('nunjucks');
const dateFilter = require('nunjucks-date-filter');
import * as moment from 'moment';

function configureHelmet(app) {

  // by setting HTTP headers appropriately.
  app.use(helmet());

  // Helmet referrer policy
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

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
      connectSrc: ['\'self\'', 'www.gov.uk', '//localhost:9856/'],
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
}

function configureHeaders(app) {
  // Disallow search index indexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });
}

function configureNunjucks(app: object) {

  const nunEnv = nunjucks.configure([
    'views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });
  nunEnv.addFilter('date', function (text) {
    if (!text) return '';
    const isoDateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/g;
    return text.replace(isoDateRegex, (date) => moment.utc(date).format(CONST.DATE_FORMAT));
  });
  nunEnv.addFilter('eval', function (text) {
    return nunjucks.renderString(text, this.ctx);
  });
}

export { configureHelmet, configureHeaders, configureNunjucks };
