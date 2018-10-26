import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';

const config = require('config');

import * as superAgent from 'superagent';
import { IdamService, TokenResponse, UserDetails } from '../services/idamService';

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
      return res.redirect(Paths.login);
    });
  };
}

function redirectToIdam(idamPath: string, idamService: IdamService) {
  return (req: Request, res: Response) => {
    const idamUrl: URL = new URL(idamUrlString);
    idamUrl.pathname = idamPath;

    const redirectUrl: string = idamService.getRedirectUrl(req.protocol, req.hostname);

    idamUrl.searchParams.append('redirect_uri', redirectUrl);
    idamUrl.searchParams.append('client_id', idamClientId);
    idamUrl.searchParams.append('response_type', 'code');

    return res.redirect(idamUrl.href);
  };
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  idamService: IdamService,
  getOnlineHearing: (email: string) => Promise<superAgent.Response>) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const code: string = req.query.code;

    if (!code) {
      return redirectToIdam(req, res);
    }

    try {
      const tokenResponse: TokenResponse = await idamService.getToken(code, req.protocol, req.hostname);
      const userDetails: UserDetails = await idamService.getUserDetails(tokenResponse.access_token);
      // todo Maybe need to check userDetails.accountStatus is 'active' and userDetails.roles contains 'citizen' on userDetails

      req.session.accessToken = tokenResponse.access_token;

      return await loadHearingAndEnterService(getOnlineHearing, userDetails.email, req, res);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

async function loadHearingAndEnterService(
  getOnlineHearing: (email: string) => Promise<superAgent.Response>,
  email: string,
  req: Request,
  res: Response) {
  const response: superAgent.Response = await getOnlineHearing(email);
  if (response.status === NOT_FOUND || response.status === UNPROCESSABLE_ENTITY) {
    logger.info(`Know issue trying to find hearing for ${email}, status ${response.status}`);

    return res.render('email-not-found.html');
  }
  req.session.hearing = response.body;
  logger.info(`Logging in ${email}`);
  return res.redirect(Paths.taskList);
}

function setupLoginController(deps) {
  const router = Router();
  router.get(Paths.login, getIdamCallback(redirectToIdam('/login', deps.idamService), deps.idamService, deps.getOnlineHearing));
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
