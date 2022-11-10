import * as CONST from '../constants';
import nunjucks = require('nunjucks');
import * as moment from 'moment';
import express = require('express');
import { InitOptions } from 'i18next';
import { I18next } from 'i18next-express-middleware';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import { Application } from 'express';

const helmet = require('helmet');
const { tyaNunjucks } = require('../core/tyaNunjucks');
const dateFilter = require('nunjucks-date-filter');
const { getContentAsString } = require('../core/contentLookup');
const { lowerCase } = require('lodash');
const content = require('../../locale/content');

const logger: LoggerInstance = Logger.getLogger('app-configuration.ts');
const config = require('config');

function configureHelmet(app) {
  // by setting HTTP headers appropriately.
  app.use(helmet());
  // Helmet referrer policy
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  // Helmet content security policy (CSP) to allow only assets from same domain.
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: ["'self' data:"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'www.google-analytics.com',
          'www.googletagmanager.com',
          'tagmanager.google.com',
          'vcc-eu4.8x8.com',
          'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js',
          'https://code.jquery.com/ui/1.12.1/jquery-ui.js',
          'https://code.jquery.com/jquery-3.6.0.js',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'tagmanager.google.com',
          'fonts.googleapis.com/',
        ],
        connectSrc: [
          "'self'",
          'www.gov.uk',
          '//localhost:9856/',
          'www.google-analytics.com',
          'www.googletagmanager.com',
        ],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", 'www.googletagmanager.com', 'vcc-eu4.8x8.com'],
        frameAncestors: ["'self'", 'www.googletagmanager.com'],
        imgSrc: [
          "'self'",
          "'self' data:",
          'www.google-analytics.com',
          'www.googletagmanager.com',
          'tagmanager.google.com',
          'vcc-eu4.8x8.com',
        ],
      },
    })
  );
}

function configureHeaders(app: Application): void {
  // Disallow search index indexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });
}

function dateRegex(text: string): string {
  if (!text) return '';
  const isoDateRegex =
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/g;
  return text.replace(isoDateRegex, (date) =>
    moment.utc(date).format(CONST.DATE_FORMAT)
  );
}

function acronym(benefitType: string): string {
  return getContentAsString(`benefitTypes.${lowerCase(benefitType)}.acronym`);
}

function dateForDecisionReceived(utcDateTimeStr: string): string {
  const howManyDaysAfterHearing = 5;
  return moment(utcDateTimeStr)
    .add(howManyDaysAfterHearing, 'days')
    .format('DD MMMM YYYY');
}

function configureNunjucks(app: express.Application, i18next: I18next): void {
  const nunEnv = nunjucks.configure(
    [
      'views',
      'app/main',
      'cookie-banner/',
      'views/notifications',
      'node_modules/govuk-frontend/govuk/',
      'node_modules/govuk-frontend/govuk/components/',
    ],
    {
      autoescape: true,
      express: app,
      noCache: true,
    }
  );
  nunEnv.addGlobal('environment', process.env.NODE_ENV);
  nunEnv.addGlobal(
    'welshEnabled',
    process.env.FT_WELSH === 'true' ||
      config.get(`featureFlags.welsh`) === 'true'
  );
  nunEnv.addGlobal('serviceName', `Manage your appeal`);
  nunEnv.addGlobal('t', (key: string, options?: InitOptions): string =>
    this.i18next.t(key, options)
  );

  app.use((req, res, next) => {
    nunEnv.addGlobal('currentUrl', req.url);
    next();
  });

  nunEnv.addFilter('date', dateRegex);
  nunEnv.addFilter('eval', function textEval(this, text) {
    try {
      if (Array.isArray(text)) {
        text = text.join(' ');
      }
      return nunjucks.renderString(text, this.ctx);
    } catch (error) {
      logger.error(`Error rendering text eval: '${text}', error:`, error);
      return 'Error rendering text';
    }
  });
  nunEnv.addFilter('isArray', Array.isArray);
  nunEnv.addFilter('dateFilter', dateFilter);
  nunEnv.addFilter(
    'agencyAcronym',
    function agencyAcronym(this, benefitType: string) {
      return nunjucks.renderString(
        content[i18next.language].benefitTypes[benefitType].agencyAcronym,
        this.ctx
      );
    }
  );
  nunEnv.addFilter('acronym', acronym);
  nunEnv.addFilter(
    'benefitAcronym',
    function benefitAcronym(this, benefitType: string) {
      return nunjucks.renderString(
        content[i18next.language].benefitTypes[benefitType].acronym,
        this.ctx
      );
    }
  );
  nunEnv.addFilter(
    'benefitFullDescription',
    function benefitFullDescription(
      this,
      benefitType: string,
      i18next: I18next
    ) {
      return nunjucks.renderString(
        content[i18next.language].benefitTypes[benefitType].fullDescription,
        this.ctx
      );
    }
  );
  nunEnv.addFilter('panel', function panel(this, benefitType: string) {
    return nunjucks.renderString(
      content[i18next.language].benefitTypes[benefitType].panel,
      this.ctx
    );
  });
  nunEnv.addFilter('dateForDecisionReceived', dateForDecisionReceived);
  nunEnv.addFilter('evalStatus', function evalStatus(this, text) {
    try {
      if (Array.isArray(text)) {
        text = text.join(' ');
      }
      return nunjucks.renderString(text, this.ctx);
    } catch (error) {
      logger.error(`Error rendering evalStatus: '${text}', error:`, error);
      return 'We are unable to provide a status update at present. Please contact us on the number below if you have any queries.';
    }
  });

  tyaNunjucks.env = nunEnv;
}

export { configureHelmet, configureHeaders, configureNunjucks };
