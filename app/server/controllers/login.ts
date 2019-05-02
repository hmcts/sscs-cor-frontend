import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY, CONFLICT } from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';
import { generateToken } from '../services/s2s';

const i18n = require('../../../locale/en.json');

const config = require('config');

import * as rp from 'request-promise';
import { IdamService, TokenResponse, UserDetails } from '../services/idam';
import { HearingService } from '../services/hearing';

const logger = Logger.getLogger('login.js');
const idamUrlString: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');

function redirectToLogin(req: Request, res: Response) {
  return res.redirect(Paths.login);
}

function getLogout(idamService: IdamService) {
  return async (req: Request, res: Response) => {
    try {
      await idamService.deleteToken(req.session.accessToken);
    } catch (error) {
      AppInsights.trackException(error);
    }

    const sessionId: string = req.session.id;
    req.session.destroy(error => {
      if (error) {
        logger.error(`Error destroying session ${sessionId}`);
      }
      logger.info(`Session destroyed ${sessionId}`);

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
    logger.log(`Redirecting to [${idamUrl.href}]`);
    return res.redirect(idamUrl.href);
  };
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  idamService: IdamService,
  hearingService: HearingService) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const code: string = req.query.code;

    if (!code) {
      const sessionId: string = req.session.id;
      return req.session.destroy(error => {
        if (error) {
          logger.error(`Error destroying session ${sessionId}`);
          throw error;
        }
        logger.info(`Session destroyed ${sessionId}`);
        return redirectToIdam(req, res);
      });
    }

    try {
      if (!req.session.accessToken) {
        logger.info('getting token');
        const tokenResponse: TokenResponse = await idamService.getToken(code, req.protocol, req.hostname);
        logger.info('getting user details');

        req.session.accessToken = tokenResponse.access_token;
        req.session.serviceToken = await generateToken();
      }
      const userDetails: UserDetails = await idamService.getUserDetails(req.session.accessToken);

      // todo Maybe need to check userDetails.accountStatus is 'active' and userDetails.roles contains 'citizen' on userDetails
      return await loadHearingAndEnterService(hearingService, idamService, userDetails.email, req, res);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

async function loadHearingAndEnterService(
  hearingService: HearingService,
  idamService: IdamService,
  email: string,
  req: Request,
  res: Response) {
  const emailToSearchFor = (req.query.caseId) ? email + '+' + req.query.caseId : email;
  const response: rp.Response = await hearingService.getOnlineHearing(emailToSearchFor, req);
  if (response.statusCode === NOT_FOUND) {
    logger.info(`Cannot find any case for ${email}`);
    const registerUrl = idamService.getRegisterUrl(req.protocol, req.hostname);
    const errorHeader = i18n.login.failed.emailNotFound.header;
    const errorBody = i18n.login.failed.emailNotFound.body;
    return res.render('load-case-error.html', { errorHeader, errorBody, registerUrl });
  } else if (response.statusCode === UNPROCESSABLE_ENTITY) {
    logger.info(`Found multiple appeals for ${email}`);
    const errorHeader = i18n.login.failed.technicalError.header;
    const errorBody = i18n.login.failed.technicalError.body;
    return res.render('load-case-error.html', { errorHeader, errorBody });
  } else if (response.statusCode === CONFLICT) {
    logger.info(`Found a non cor appeal for ${email}`);
    const errorHeader = i18n.login.failed.cannotUseService.header;
    const errorBody = i18n.login.failed.cannotUseService.body;
    return res.render('load-case-error.html', { errorHeader, errorBody });
  }

  req.session.hearing = response.body;
  logger.info(`Logging in ${email}`);
  return res.redirect(Paths.taskList);
}

function setupLoginController(deps) {
  const router = Router();
  router.get(Paths.login, getIdamCallback(redirectToIdam('/login', deps.idamService), deps.idamService, deps.hearingService));
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
