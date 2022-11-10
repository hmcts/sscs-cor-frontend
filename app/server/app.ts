import * as AppInsights from './app-insights';

import * as express from 'express';
import { Application, RequestHandler } from 'express';

import { router as routes } from './routes';

import * as health from './middleware/health';

import * as Paths from './paths';

import * as cookieParser from 'cookie-parser';

import * as screenReaderUtils from './utils/screenReaderUtils';
import {
  configureHeaders,
  configureHelmet,
  configureNunjucks,
} from './app-configurations';
import watch from './watch';
import * as config from 'config';
import { Feature, isFeatureEnabled } from './utils/featureEnabled';
import { csrfToken, csrfTokenEmbed } from './middleware/csrf';
import * as path from 'path';

const { Express } = require('@hmcts/nodejs-logging');
const errors = require('./middleware/error-handler');
const content = require('../../locale/content');
const bodyParser = require('body-parser');
const {
  fileTypes,
  fileTypesWithAudioVideo,
} = require('./utils/mimeTypeWhitelist');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-express-middleware');

const isDevelopment = process.env.NODE_ENV === 'development';

interface Options {
  disableAppInsights?: boolean;
}

function setup(sessionHandler: RequestHandler, options: Options) {
  i18next.init({
    resources: content,
    supportedLngs: config.get('languages'),
    lng: 'en',
  });

  const opts = options || {};
  if (!opts.disableAppInsights) {
    AppInsights.enable();
  }

  const app: Application = express();

  if (!isDevelopment) {
    // Protect against some well known web vulnerabilities
    configureHelmet(app);
  }
  configureHeaders(app);

  app.set('view engine', 'html');
  app.locals.i18n = i18next;
  app.locals.content = content;

  if (config.get('featureFlags.mediaFilesAllowed') === 'true') {
    app.locals.fileTypAudioVideoWhiteList = fileTypesWithAudioVideo;
  } else {
    app.locals.fileTypAudioVideoWhiteList = '';
  }
  app.locals.fileTypeWhiteList = fileTypes;

  app.locals.screenReaderUtils = screenReaderUtils;

  if (isDevelopment) {
    void watch(app);
    app.locals.isDev = true;
  } else {
    app.set('trust proxy', 1);
  }

  configureNunjucks(app);

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(cookieParser());
  // Get Base url and contact us configuration
  app.use((req, res, next) => {
    const connect = req.cookies['connect.sid'];

    res.cookie('connect.sid', connect, { secure: true, sameSite: 'strict' });
    app.locals.webChat = config.get('services.webChat');
    app.locals.webFormUrl = config.get('services.webForm.url');
    app.locals.allowContactUs = isFeatureEnabled(
      Feature.ALLOW_CONTACT_US,
      req.cookies
    );
    app.locals.contactUsWebFormEnabled = isFeatureEnabled(
      Feature.CONTACT_US_WEB_FORM_ENABLED,
      req.cookies
    );
    app.locals.contactUsTelephoneEnabled = isFeatureEnabled(
      Feature.CONTACT_US_TELEPHONE_ENABLED,
      req.cookies
    );
    app.locals.webChatEnabled = isFeatureEnabled(
      Feature.CONTACT_US_WEBCHAT_ENABLED,
      req.cookies
    );
    app.locals.cookieBannerEnabled = isFeatureEnabled(
      Feature.ALLOW_COOKIE_BANNER_ENABLED,
      req.cookies
    );
    // fixme needed?
    app.locals.mediaFilesAllowed = isFeatureEnabled(
      Feature.MEDIA_FILES_ALLOWED_ENABLED,
      req.cookies
    );
    app.locals.baseUrl = `${req.protocol}://${req.headers.host}`;
    next();
  });
  app.use('/public', express.static(path.join(__dirname, '/../../public')));
  app.use(Express.accessLogger());
  app.use(sessionHandler);
  app.use(csrfToken);
  app.use(csrfTokenEmbed);
  app.use(Paths.health, health.getHealthConfigure());
  app.use(Paths.readiness, health.getReadinessConfigure());
  app.use(errors.sessionNotFoundHandler);
  app.use(routes);
  app.use(errors.pageNotFoundHandler);
  app.use(errors.coreErrorHandler);
  app.use(i18nextMiddleware.handle(i18next));
  return app;
}

export { setup };
