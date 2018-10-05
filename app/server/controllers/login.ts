import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import * as Paths from '../paths';
import { OnlineHearing } from '../services/getOnlineHearing';
import { URL } from 'url';

const config = require('config');
import { UserDetails, TokenResponse } from 'app/server/services/idamService';

import * as superAgent from 'superagent';

const logger = Logger.getLogger('login.js');
const idamUrlString: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');

function getLogin(getRedirectUrl: (protocol: string, hostname: string) => string, idamPath: string) {
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

function getIdamCallback(
  getToken: (code: string, protocol: string, hostname: string) => TokenResponse,
  getUserDetails: (accessToken: string) => UserDetails,
  getOnlineHearing: (email:string) => superAgent.Response,
  getRedirectUrl: (protocol: string, hostname: string) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {

    const code: string = req.query.code;

    if (!code) {
      return getLogin(getRedirectUrl, '/login')(req, res);
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
  const hearing: OnlineHearing = response.body;
  req.session.hearing = hearing;
  logger.info(`Logging in ${email}`);
  return res.redirect(Paths.taskList);
}

function setupLoginController(deps) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.login, getLogin(deps.getRedirectUrl, '/login'));
  router.get(Paths.register, getLogin(deps.getRedirectUrl, '/users/selfRegister'));
  router.get(Paths.logout, getLogout);
  router.get(Paths.idamCallback, getIdamCallback(deps.getToken, deps.getUserDetails, deps.getOnlineHearing, deps.getRedirectUrl));
  return router;
}

export {
  setupLoginController,
  getLogin,
  getLogout,
  getIdamCallback,
  loadHearingAndEnterService
};
