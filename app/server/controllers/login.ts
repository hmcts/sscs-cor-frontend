import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';

const config = require('config');
import { UserDetails, TokenResponse } from '../services/idamService';

import * as superAgent from 'superagent';

const logger = Logger.getLogger('login.js');
const idamUrlString: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');
const enableDummyLogin = config.get('enableDummyLogin') === 'true';

function redirectToLogin(req: Request, res: Response) {
    return res.redirect(Paths.login);
}

function getLogout(req: Request, res: Response) {
  const sessionId: string = req.session.id;
  req.session.destroy(error => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function redirectToIdam(idamPath: string, getRedirectUrl: (protocol: string, hostname: string) => string) {
  return (req: Request, res: Response) => {
    const idamUrl: URL = new URL(idamUrlString);
    idamUrl.pathname = idamPath;

    const redirectUrl: string = getRedirectUrl(req.protocol, req.hostname);

    idamUrl.searchParams.append('redirect_uri', redirectUrl);
    idamUrl.searchParams.append('client_id', idamClientId);
    idamUrl.searchParams.append('response_type', 'code');

    return res.redirect(idamUrl.href);
  }
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  getToken: (code: string, protocol: string, hostname: string) => TokenResponse,
  getUserDetails: (accessToken: string) => UserDetails,
  getOnlineHearing: (email:string) => superAgent.Response) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const code: string = req.query.code;

    if (!code) {
      return redirectToIdam(req, res);
    }

    try {
      const tokenResponse: TokenResponse = await getToken(code, req.protocol, req.hostname);
      const userDetails: UserDetails = await getUserDetails(tokenResponse.access_token);
      // todo Maybe need to check userDetails.accountStatus is 'active' and userDetails.roles contains 'citizen' on userDetails

      const email: string = userDetails.email;

      return await loadHearingAndEnterService(getOnlineHearing, email, req, res)
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function getDummyLogin(req: Request, res: Response) {
  return res.render('dummy-login.html');
}

function postDummyLogin(getOnlineHearing) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const email: string = req.body['username'];

    try {
      return loadHearingAndEnterService(getOnlineHearing, email, req, res);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

async function loadHearingAndEnterService(
  getOnlineHearing: (email:string) => superAgent.Response,
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
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.login, getIdamCallback(redirectToIdam('/login', deps.getRedirectUrl), deps.getToken, deps.getUserDetails, deps.getOnlineHearing));
  router.get(Paths.register, redirectToIdam('/users/selfRegister', deps.getRedirectUrl));
  router.get(Paths.logout, getLogout);

  if (enableDummyLogin) {
    router.get(Paths.dummyLogin, getDummyLogin);
    router.post(Paths.dummyLogin, postDummyLogin(deps.getOnlineHearing));
  }

  return router;
}

export {
  setupLoginController,
  redirectToLogin,
  redirectToIdam,
  getLogout,
  getIdamCallback,
  getDummyLogin,
  postDummyLogin
};
