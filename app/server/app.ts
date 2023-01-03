import * as AppInsights from './app-insights';
import express, { Application, RequestHandler } from 'express';
import { router as routes } from './routes';
import * as health from './middleware/health';
import * as Paths from './paths';
import cookieParser from 'cookie-parser';
import * as screenReaderUtils from './utils/screenReaderUtils';
import {
  configureHeaders,
  configureHelmet,
  configureNunjucks,
} from './app-configurations';
import watch from './watch';
import config from 'config';
import { Feature, isFeatureEnabled } from './utils/featureEnabled';
import { csrfToken, csrfTokenEmbed } from './middleware/csrf';
import * as path from 'path';
import i18next, { InitOptions } from 'i18next';
import i18nextMiddleware from 'i18next-express-middleware';
import bodyParser from 'body-parser';
import * as errors from './middleware/error-handler';
import { Express as loggingExpress } from '@hmcts/nodejs-logging';
import { fileTypes, fileTypesWithAudioVideo } from './data/typeWhitelist.json';

import content from '../common/locale/content.json';

const isDevelopment = process.env.NODE_ENV === 'development';

const supportedLngs: string[] = config.get('languages');
const defaultLng = 'en';
const i18Options: InitOptions = {
  resources: content,
  supportedLngs,
  lng: defaultLng,
};

export async function setupApp(
  sessionHandler: RequestHandler,
  appInsights = false
): Promise<Application> {
  await i18next.init(i18Options);

  if (appInsights) {
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
  app.use(
    '/public/govuk-frontend',
    express.static(
      path.join(
        __dirname,
        '/../../node_modules',
        'govuk-frontend',
        'govuk',
        'assets'
      )
    )
  );
  app.use(
    '/public/images',
    express.static(path.join(__dirname, '/../../app', 'client', 'images'))
  );
  app.use(
    '/public/js',
    express.static(
      path.join(
        __dirname,
        '/../../node_modules',
        '@hmcts',
        'ctsc-web-chat',
        'assets',
        'javascript'
      )
    )
  );
  app.use(
    '/public/css',
    express.static(
      path.join(
        __dirname,
        '/../../node_modules',
        '@hmcts',
        'ctsc-web-chat',
        'assets',
        'css'
      )
    )
  );

  app.use(loggingExpress.accessLogger());
  app.use(sessionHandler);
  app.use(csrfToken);
  app.use(csrfTokenEmbed);
  app.use(Paths.health, health.getHealthConfigure());
  app.use(Paths.readiness, health.getReadinessConfigure());
  app.use(errors.sessionNotFoundHandler);
  app.use(routes);
  app.use(errors.pageNotFoundHandler);
  app.use(errors.forbiddenHandler);
  app.use(errors.badRequestHandler);
  app.use(errors.coreErrorHandler);
  app.use(i18nextMiddleware.handle(i18next));
  return app;
}
