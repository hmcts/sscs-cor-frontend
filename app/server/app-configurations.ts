import nunjucks from 'nunjucks';
import { i18n, InitOptions } from 'i18next';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import express, { Application } from 'express';
import { utc } from 'moment';
import helmet from 'helmet';
import config from 'config';
import { tyaNunjucks } from './controllers/content';
import { dateFormat } from './utils/dateUtils';
import { ContentSecurityPolicyOptions } from 'helmet/dist/types/middlewares/content-security-policy';
import { ReferrerPolicyOptions } from 'helmet/dist/types/middlewares/referrer-policy';
import { Feature, isFeatureEnabled } from './utils/featureEnabled';
import content from '../common/locale/content.json';
import * as path from 'path';

const logger: LoggerInstance = Logger.getLogger('app-configuration.ts');

const defaultDateFormat: string = config.get('default.dateFormat');

const DecisionReceivedDaysAfterHearing = 5;

// Helmet referrer policy
const referrerPolicy: ReferrerPolicyOptions = { policy: 'origin' };

// Helmet content security policy (CSP) to allow only assets from same domain.
const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'self'"],
    fontSrc: ["'self' data:"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      '*.google-analytics.com',
      '*.googletagmanager.com',
      'tagmanager.google.com',
      'vcc-eu4.8x8.com',
      'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js',
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
      '*.google-analytics.com',
      '*.googletagmanager.com',
    ],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", '*.googletagmanager.com', 'vcc-eu4.8x8.com'],
    frameAncestors: ["'self'", '*.googletagmanager.com'],
    imgSrc: [
      "'self'",
      "'self' data:",
      '*.google-analytics.com',
      '*.googletagmanager.com',
      'tagmanager.google.com',
      'vcc-eu4.8x8.com',
    ],
  },
};
export function configureHelmet(app: Application): void {
  // by setting HTTP headers appropriately.
  app.use(helmet());

  app.use(helmet.referrerPolicy(referrerPolicy));

  app.use(helmet.contentSecurityPolicy(contentSecurityPolicy));
}

export function configureHeaders(app: Application): void {
  // Disallow search indexing
  app.use((req, res, next) => {
    // Setting headers stops pages being indexed even if indexed pages link to them
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });
}

function dateForDecisionReceived(
  utcDateTimeStr: string,
  locale: string
): string {
  const decisionReceivedDate = utc(utcDateTimeStr).add(
    DecisionReceivedDaysAfterHearing,
    'days'
  );
  return dateFormat(decisionReceivedDate, defaultDateFormat, locale);
}

function flattenArray(text: string | Array<string>): string {
  if (Array.isArray(text)) {
    return text.join(' ');
  }
  return text;
}

export function configureNunjucks(app: Application): void {
  if (!isFeatureEnabled(Feature.JQUERY_VERSION_FLAG)) {
    contentSecurityPolicy.directives.scriptSrc.push('https://code.jquery.com/ui/1.12.1/jquery-ui.js');
    contentSecurityPolicy.directives.scriptSrc.push('https://code.jquery.com/jquery-3.6.0.js');
  }
  const i18next: i18n = app.locals.i18n;

  const nunEnv = nunjucks.configure(['views', 'node_modules/govuk-frontend'], {
    autoescape: true,
    express: app,
    noCache: true,
  });
  nunEnv.addGlobal('environment', process.env.NODE_ENV);
  nunEnv.addGlobal('welshEnabled', config.get(`featureFlags.welsh`) === 'true');
  nunEnv.addGlobal('serviceName', `Manage your appeal`);
  nunEnv.addGlobal('t', (key: string, options?: InitOptions): string =>
    this.i18next.t(key, options)
  );

  app.use((req, res, next) => {
    nunEnv.addGlobal('currentUrl', req.url);
    next();
  });

  nunEnv.addFilter(
    'eval',
    function textEval(this, text: string | Array<string>) {
      try {
        return nunjucks.renderString(flattenArray(text), this.ctx);
      } catch (error) {
        logger.error(`Error rendering text eval: '${text}', error:`, error);
        return 'Error rendering text';
      }
    }
  );
  nunEnv.addFilter('dateFormat', dateFormat);
  nunEnv.addFilter(
    'agencyAcronym',
    function agencyAcronym(this, benefitType: string) {
      return nunjucks.renderString(
        content[i18next.language].benefitTypes[benefitType].agencyAcronym,
        this.ctx
      );
    }
  );
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
    function benefitFullDescription(this, benefitType: string) {
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
  nunEnv.addFilter(
    'evalStatus',
    function evalStatus(this, text): Array<string> {
      try {
        if (Array.isArray(text)) {
          const renderedArray: Array<string> = Array<string>();
          text.forEach((item: string) => {
            renderedArray.push(nunjucks.renderString(item, this.ctx));
          });
          return renderedArray;
        }
        return [nunjucks.renderString(text, this.ctx)];
      } catch (error) {
        logger.error(`Error rendering evalStatus: '${text}', error:`, error);
        return [
          'We are unable to provide a status update at present. Please contact us on the number below if you have any queries.',
        ];
      }
    }
  );

  tyaNunjucks.env = nunEnv;
}

const publicPath = path.join(__dirname, '..', '..', 'public');
const imagesPath = path.join(__dirname, '..', '..', 'app', 'client', 'images');
const jsPath = path.join(__dirname, '..', '..', 'app', 'client', 'js');
const govUkAssetsPath = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  'govuk-frontend',
  'govuk',
  'assets'
);
const ctscJsPath = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '@hmcts',
  'ctsc-web-chat',
  'assets',
  'javascript'
);
const ctscCssPath = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '@hmcts',
  'ctsc-web-chat',
  'assets',
  'css'
);

export function configureStaticRoutes(app: Application): void {
  logger.info(`'/public' routes to ${publicPath}`);
  app.use('/public', express.static(publicPath));
  logger.info(`'/public/images' routes to ${imagesPath}`);
  app.use('/public/images', express.static(imagesPath));
  logger.info(`'/public/js' routes to ${jsPath}`);
  app.use('/public/js', express.static(jsPath));

  logger.info(`'/public/govuk-frontend' routes to ${govUkAssetsPath}`);
  app.use('/public/govuk-frontend', express.static(govUkAssetsPath));

  logger.info(`'/public/js' routes to ${ctscJsPath}`);
  app.use('/public/js', express.static(ctscJsPath));
  logger.info(`'/public/css' routes to ${ctscCssPath}`);
  app.use('/public/css', express.static(ctscCssPath));
}
