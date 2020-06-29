import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY, CONFLICT, OK } from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';
import { generateToken } from '../services/s2s';
const i18n = require('../../../locale/en.json');

const config = require('config');

import * as rp from 'request-promise';
import { IdamService, TokenResponse, UserDetails } from '../services/idam';
import { HearingService } from '../services/hearing';
import { TrackYourApealService } from '../services/tyaService';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';

const logger = Logger.getLogger('login.js');
const idamUrlString: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');

function redirectToLogin(req: Request, res: Response) {
  return res.redirect(Paths.login);
}

function getLogout(idamService: IdamService) {
  return async (req: Request, res: Response) => {

    if (req.session.accessToken) {
      try {
        await idamService.deleteToken(req.session.accessToken);
      } catch (error) {
        AppInsights.trackException(error);
      }
    }

    const sessionId: string = req.session.id;

    req.session.destroy(error => {
      if (error) {
        logger.error(`Error destroying session ${sessionId}`);
        AppInsights.trackException(error);
      }
      logger.info(`Session destroyed ${sessionId}`);
      AppInsights.trackTrace(`Session destroyed ${sessionId}`);
      AppInsights.trackEvent('MYA_USER_LOGOUT');

      if (req.query.redirectUrl) {
        return res.redirect(req.query.redirectUrl);
      } else {
        return res.redirect(Paths.login);
      }
    });
  };
}

function redirectToIdam(idamPath: string, idamService: IdamService) {

  return (req: Request, res: Response) => {
    const idamUrl: URL = new URL(idamUrlString);
    idamUrl.pathname = idamUrl.pathname !== '/' ? idamUrl.pathname + idamPath : idamPath;

    const redirectUrl: string = idamService.getRedirectUrl(req.protocol, req.hostname);

    idamUrl.searchParams.append('redirect_uri', redirectUrl);
    idamUrl.searchParams.append('client_id', idamClientId);
    idamUrl.searchParams.append('response_type', 'code');

    if (req.query.tya) {
      idamUrl.searchParams.append('state', req.query.tya);
    } else if (req.query.state) {
      idamUrl.searchParams.append('state', req.query.state);
    }

    logger.log(`Redirecting to [${idamUrl.href}]`);
    AppInsights.trackEvent('MYA_REDIRECT_IDAM_LOGIN');
    return res.redirect(idamUrl.href);
  };
}

function getHearingsByName(hearings) {
  const hearingsByName = {};
  hearings.forEach(hearing => {
    const appellantName = hearing.appellant_name;
    if (!hearingsByName[appellantName]) {
      hearingsByName[appellantName] = [];
    }
    hearingsByName[appellantName].push(hearing);
  });
  return hearingsByName;
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  idamService: IdamService,
  hearingService: HearingService,
  trackYourApealService: TrackYourApealService) {

  return async (req: Request, res: Response, next: NextFunction) => {
    const code: string = req.query.code;
    if (!code) {
      const sessionId: string = req.session.id;
      return req.session.destroy(error => {
        if (error) {
          logger.error(`Error destroying session ${sessionId}`);
          AppInsights.trackException(error);
          throw error;
        }
        logger.info(`Session destroyed ${sessionId}`);
        return redirectToIdam(req, res);
      });
    }

    try {
      if (!req.session.accessToken) {
        try {
          logger.info('getting token');
          const tokenResponse: TokenResponse = await idamService.getToken(code, req.protocol, req.hostname);

          logger.info('getting user details');

          req.session.accessToken = tokenResponse.access_token;
          req.session.serviceToken = await generateToken();
          req.session.tya = req.query.state;

        } catch (error) {
          const tokenError = new Error('Idam token verification failed for code ' + code + ' with error ' + error.message);
          AppInsights.trackException(tokenError);
          AppInsights.trackEvent('MYA_IDAM_CODE_AUTH_ERROR');
          throw tokenError;
        }
      }

      const { email }: UserDetails = await idamService.getUserDetails(req.session.accessToken);
      req.session.idamEmail = email;

      if (isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) {

        const { statusCode, body }: rp.Response = await hearingService.getOnlineHearingsForCitizen(email, req.session.tya, req);
        if (statusCode !== OK) return renderErrorPage(email, statusCode, idamService, req, res);

        const hearings = req.query.caseId ?
          body.filter(hearing => hearing.case_id + '' === req.query.caseId) : body;

        hearings.forEach(value => {
          value.case_reference = value.case_id ? value.case_id.toString() : '';
          if (value.case_reference === '') {
            throw new Error('Case ID cannot be empty');
          }
        });

        AppInsights.trackEvent('MYA_LOGIN_SUCCESS');

        if (hearings.length === 0) {
          return res.redirect(Paths.assignCase);
        } else if (hearings.length === 1) {
          req.session.hearing = hearings[0];
          const { appeal, subscriptions } = await trackYourApealService.getAppeal(req.session.hearing.case_id, req);
          req.session.appeal = appeal;
          req.session.subscriptions = subscriptions;

          logger.info(`Logging in ${email}`);
          AppInsights.trackTrace(`[${req.session.hearing && req.session.hearing.case_id}] - User logged in successfully as ${email}`);
          if (req.session.appeal.hearingType === 'cor') {
            return res.redirect(Paths.taskList);
          } else {
            return res.redirect(Paths.status);
          }
        } else {
          const hearingsByName = getHearingsByName(hearings);
          AppInsights.trackTrace(`[Cases count ${hearings.length}] - User logged in successfully as ${email}`);
          return res.render('select-case.html', { hearingsByName });
        }
      } else {
        const emailToSearchFor = (req.query.caseId) ? email + '+' + req.query.caseId : email;
        const { statusCode, body }: rp.Response = await hearingService.getOnlineHearing(emailToSearchFor, req);
        if (statusCode !== OK) return renderErrorPage(emailToSearchFor, statusCode, idamService, req, res);

        req.session.hearing = body;

        logger.info(`Logging in ${emailToSearchFor}`);
        AppInsights.trackTrace(`[${req.session.hearing && req.session.hearing.case_id}] - User logged in successfully as ${email}`);
        return res.redirect(Paths.taskList);
      }
    } catch (error) {
      AppInsights.trackException(error);
      AppInsights.trackEvent('MYA_LOGIN_FAIL');
      return next(error);
    }
  };
}

function renderErrorPage(email: string, statusCode: number, idamService: IdamService, req: Request, res: Response) {
  const options = {};
  if (statusCode === NOT_FOUND) {
    logger.info(`Cannot find any case for ${email}`);
    options['registerUrl'] = idamService.getRegisterUrl(req.protocol, req.hostname);
    options['errorHeader'] = i18n.login.failed.emailNotFound.header;
    options['errorBody'] = i18n.login.failed.emailNotFound.body;
  } else if (statusCode === UNPROCESSABLE_ENTITY) {
    logger.info(`Found multiple appeals for ${email}`);
    options['errorHeader'] = i18n.login.failed.technicalError.header;
    options['errorBody'] = i18n.login.failed.technicalError.body;
  } else if (statusCode === CONFLICT) {
    logger.info(`Found a non cor appeal for ${email}`);
    options['errorHeader'] = i18n.login.failed.cannotUseService.header;
    options['errorBody'] = i18n.login.failed.cannotUseService.body;
  }
  return res.render('load-case-error.html', { ...options });
}

function setupLoginController(deps) {
  const router = Router();
  router.get(Paths.login, getIdamCallback(redirectToIdam('/login', deps.idamService), deps.idamService, deps.hearingService, deps.trackYourApealService));
  router.get(Paths.register, redirectToIdam('/users/selfRegister', deps.idamService));
  router.get(Paths.logout, getLogout(deps.idamService));
  return router;
}

export {
  setupLoginController,
  redirectToLogin,
  redirectToIdam,
  getLogout,
  getIdamCallback
};
