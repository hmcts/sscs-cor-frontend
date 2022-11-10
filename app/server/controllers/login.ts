import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import {
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  CONFLICT,
  OK,
} from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';
import { generateToken } from '../services/s2s';

import * as rp from 'request-promise';
import { IdamService, TokenResponse, UserDetails } from '../services/idam';
import { HearingService } from '../services/hearing';
import { TrackYourApealService } from '../services/tyaService';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';
import { getHearingsByName } from '../utils/fieldValidation';
const content = require('../../../locale/content');
const config = require('config');

const logger = Logger.getLogger('login.js');
const idamUrlString: string = config.get('idam.url');
const idamClientId: string = config.get('idam.client.id');

function redirectToLogin(req: Request, res: Response) {
  return res.redirect(Paths.login);
}

function getLogout(idamService: IdamService) {
  return async (req: Request, res: Response) => {
    if (req.session['accessToken']) {
      try {
        await idamService.deleteToken(req.session['accessToken']);
      } catch (error) {
        AppInsights.trackException(error);
      }
    }

    const sessionId: string = req.session.id;

    req.session.destroy((error) => {
      if (error) {
        logger.error(`Error destroying session ${sessionId}`);
        AppInsights.trackException(error);
      }
      logger.info(`Session destroyed ${sessionId}`);
      AppInsights.trackTrace(`Session destroyed ${sessionId}`);
      AppInsights.trackEvent('MYA_USER_LOGOUT');

      if (req.query.redirectUrl) {
        return res.redirect(req.query.redirectUrl as string);
      }
      return res.redirect(Paths.login);
    });
  };
}

function redirectToIdam(idamPath: string, idamService: IdamService) {
  return (req: Request, res: Response) => {
    const idamUrl: URL = new URL(idamUrlString);
    idamUrl.pathname =
      idamUrl.pathname === '/' ? idamPath : idamUrl.pathname + idamPath;

    const redirectUrl: string = idamService.getRedirectUrl(
      req.protocol,
      req.hostname
    );

    idamUrl.searchParams.append('redirect_uri', redirectUrl);
    idamUrl.searchParams.append('client_id', idamClientId);
    idamUrl.searchParams.append('response_type', 'code');

    if (req.query.tya) {
      idamUrl.searchParams.append('state', req.query.tya as string);
    } else if (req.query.state) {
      idamUrl.searchParams.append('state', req.query.state as string);
    }
    logger.log(`Redirecting to [${idamUrl.href}]`);
    AppInsights.trackEvent('MYA_REDIRECT_IDAM_LOGIN');
    return res.redirect(idamUrl.href);
  };
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  idamService: IdamService,
  hearingService: HearingService,
  trackYourApealService: TrackYourApealService
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const code: string = req.query.code as string;
    if (!code) {
      const sessionId: string = req.session.id;
      return req.session.destroy((error) => {
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
      if (!req.session['accessToken']) {
        try {
          logger.info('getting token');
          const tokenResponse: TokenResponse = await idamService.getToken(
            code,
            req.protocol,
            req.hostname
          );
          req.session['accessToken'] = tokenResponse.access_token;
          req.session['serviceToken'] = await generateToken();
          req.session['tya'] = req.query.state;
        } catch (error) {
          const tokenError = new Error(
            `Idam token verification failed for code ${code} with error ${error.message}`
          );
          AppInsights.trackException(tokenError);
          AppInsights.trackEvent('MYA_IDAM_CODE_AUTH_ERROR');
          throw tokenError;
        }
      }

      const { email }: UserDetails = await idamService.getUserDetails(
        req.session['accessToken']
      );
      req.session['idamEmail'] = email;

      const { statusCode, body }: rp.Response =
        await hearingService.getOnlineHearingsForCitizen(
          email,
          req.session['tya'],
          req
        );

      if (statusCode !== OK)
        return renderErrorPage(email, statusCode, idamService, req, res);

      const hearings = req.query.caseId
        ? body.filter((hearing) => `${hearing.case_id}` === req.query.caseId)
        : body;

      hearings.forEach((value) => {
        value.case_reference = value.case_id ? value.case_id.toString() : '';
        if (value.case_reference === '') {
          const missingHearingIdError = new Error(
            'Case ID cannot be empty from hearing in session'
          );
          AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
          throw missingHearingIdError;
        }
      });

      AppInsights.trackEvent('MYA_LOGIN_SUCCESS');
      if (hearings.length === 0) {
        return res.redirect(Paths.assignCase);
      } else if (hearings.length === 1) {
        req.session['hearing'] = hearings[0];
        const { appeal, subscriptions } = await trackYourApealService.getAppeal(
          req.session['hearing'].case_id,
          req
        );
        req.session['appeal'] = appeal;
        req.session['subscriptions'] = subscriptions;
        req.session['hideHearing'] =
          // eslint-disable-next-line no-eq-null,eqeqeq
          appeal.hideHearing == null ? false : appeal.hideHearing;

        logger.info(
          `Logging in ${email} for benefit type ${appeal.benefitType}`
        );
        AppInsights.trackTrace(
          `[${req.session['hearing']?.case_id}] - User logged in successfully as ${email}`
        );

        if (req.session['appeal'].hearingType === 'cor') {
          return res.redirect(Paths.taskList);
        }
        return res.redirect(Paths.status);
      }
      const hearingsByName = getHearingsByName(hearings);
      AppInsights.trackTrace(
        `[Cases count ${hearings.length}] - User logged in successfully as ${email}`
      );
      if (isFeatureEnabled(Feature.MYA_PAGINATION_ENABLED, req.cookies)) {
        req.session['hearings'] = hearings;
        return res.redirect(Paths.activeCases);
      }
      return res.render('select-case.njk', { hearingsByName });
    } catch (error) {
      AppInsights.trackException(error);
      AppInsights.trackEvent('MYA_LOGIN_FAIL');
      return next(error);
    }
  };
}

function renderErrorPage(
  email: string,
  statusCode: number,
  idamService: IdamService,
  req: Request,
  res: Response
) {
  const options = {};
  if (statusCode === NOT_FOUND) {
    logger.info(`Cannot find any case for ${email}`);
    options['registerUrl'] = idamService.getRegisterUrl(
      req.protocol,
      req.hostname
    );
    options['errorHeader'] = content.en.login.failed.emailNotFound.header;
    options['errorBody'] = content.en.login.failed.emailNotFound.body;
  } else if (statusCode === UNPROCESSABLE_ENTITY) {
    logger.info(`Found multiple appeals for ${email}`);
    options['errorHeader'] = content.en.login.failed.technicalError.header;
    options['errorBody'] = content.en.login.failed.technicalError.body;
  } else if (statusCode === CONFLICT) {
    logger.info(`Found a non cor appeal for ${email}`);
    options['errorHeader'] = content.en.login.failed.cannotUseService.header;
    options['errorBody'] = content.en.login.failed.cannotUseService.body;
  }
  return res.render('load-case-error.njk', { ...options });
}

function setupLoginController(deps) {
  const router = Router();
  router.get(
    Paths.login,
    getIdamCallback(
      redirectToIdam('/login', deps.idamService),
      deps.idamService,
      deps.hearingService,
      deps.trackYourApealService
    )
  );
  router.get(
    Paths.register,
    redirectToIdam('/users/selfRegister', deps.idamService)
  );
  router.get(Paths.logout, getLogout(deps.idamService));
  return router;
}

export {
  setupLoginController,
  redirectToLogin,
  redirectToIdam,
  getLogout,
  getIdamCallback,
};
