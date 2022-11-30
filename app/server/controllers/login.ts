import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import {
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  CONFLICT,
  OK,
  UNAUTHORIZED,
} from 'http-status-codes';
import * as Paths from '../paths';
import { URL } from 'url';
import { generateToken } from '../services/s2s';

import { IdamService, TokenResponse, UserDetails } from '../services/idam';
import { CaseDetails, CaseService } from '../services/cases';
import { TrackYourApealService } from '../services/tyaService';
import { Feature, isFeatureEnabled } from '../utils/featureEnabled';
import { Dependencies } from '../routes';
import HttpException from '../exceptions/HttpException';
import { LoggerInstance } from 'winston';
import * as config from 'config';
import i18next from 'i18next';

const content = require('../../../locale/content');

const logger: LoggerInstance = Logger.getLogger('login.js');
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
    logger.info(`Redirecting to [${idamUrl.href}]`);
    AppInsights.trackEvent('MYA_REDIRECT_IDAM_LOGIN');
    return res.redirect(idamUrl.href);
  };
}

function getIdamCallback(
  redirectToIdam: (req: Request, res: Response) => void,
  idamService: IdamService,
  caseService: CaseService,
  trackYourAppealService: TrackYourApealService
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
          const tokenError = new HttpException(
            UNAUTHORIZED,
            `Idam token verification failed for code ${code} with error ${error.message}`
          );
          logger.error('MYA_IDAM_CODE_AUTH_ERROR', tokenError);
          AppInsights.trackException(tokenError);
          AppInsights.trackEvent('MYA_IDAM_CODE_AUTH_ERROR');
          throw tokenError;
        }
      }

      const { email }: UserDetails = await idamService.getUserDetails(
        req.session['accessToken']
      );
      req.session['idamEmail'] = email;

      let statusCode: number = null;
      let body: Array<CaseDetails> = null;
      ({ statusCode, body } = await caseService.getCasesForCitizen(
        email,
        req.session['tya'],
        req
      ));

      if (statusCode !== OK)
        return renderErrorPage(email, statusCode, idamService, req, res);

      const cases: Array<CaseDetails> = req.query.caseId
        ? body.filter(
            (caseDetails: CaseDetails) =>
              `${caseDetails.case_id}` === req.query.caseId
          )
        : body;

      cases.forEach((value) => {
        const caseId: string = value?.case_id?.toString();
        if (caseId?.length > 0) {
          value.case_reference = caseId;
        } else {
          const missingHearingIdError = new HttpException(
            NOT_FOUND,
            'Case ID cannot be empty from hearing in session'
          );
          logger.error('MYA_SESSION_READ_FAIL', missingHearingIdError);
          AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
          throw missingHearingIdError;
        }
      });

      logger.info('MYA_LOGIN_SUCCESS');
      AppInsights.trackEvent('MYA_LOGIN_SUCCESS');
      if (cases.length === 0) {
        return res.redirect(Paths.assignCase);
      }

      const caseDetail = cases[0];
      const caseId = caseDetail.case_id;
      if (cases.length === 1) {
        req.session['case'] = caseDetail;
        const { appeal, subscriptions } =
          await trackYourAppealService.getAppeal(String(caseId), req);
        req.session['appeal'] = appeal;
        req.session['subscriptions'] = subscriptions;
        req.session['hideHearing'] =
          // eslint-disable-next-line no-eq-null,eqeqeq
          appeal.hideHearing == null ? false : appeal.hideHearing;

        logger.info(
          `Logging in ${email} for benefit type ${appeal.benefitType}, Case Id: ${caseId}`
        );
        AppInsights.trackTrace(
          `[${req.session['case']?.case_id}] - User logged in successfully as ${email}`
        );

        if (req.session['appeal'].hearingType === 'cor') {
          return res.redirect(Paths.taskList);
        }
        return res.redirect(Paths.status);
      }
      logger.info(
        `Logging in ${email} for Cases count ${cases.length}, Case Id: ${caseId}`
      );
      AppInsights.trackTrace(
        `[Cases count ${cases.length}] - User logged in successfully as ${email}`
      );

      req.session['cases'] = cases;

      logger.info(`Cases stored: ${caseDetail.case_id}`);

      if (isFeatureEnabled(Feature.MYA_PAGINATION_ENABLED, req.cookies)) {
        return res.redirect(Paths.activeCases);
      }
      return res.redirect(Paths.selectCase);
    } catch (error) {
      logger.error('MYA_LOGIN_FAIL', error);
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
): void {
  let header: string = null;
  const messages: Array<string> = [];
  if (statusCode === NOT_FOUND) {
    logger.info(`Cannot find any case for ${email}`);
    header = content[i18next.language].login.failed.emailNotFound.header;
    const errorMessages: Array<string> =
      content[i18next.language].login.failed.emailNotFound.messages;
    messages.push(...errorMessages);
    const registerLink = new HTMLLinkElement();
    registerLink.href = idamService.getRegisterUrl(req.protocol, req.hostname);
    registerLink.classList.add('govuk-link');
    messages.push(registerLink.outerHTML);
  } else if (statusCode === UNPROCESSABLE_ENTITY) {
    logger.info(`Found multiple appeals for ${email}`);
    header = content[i18next.language].login.failed.technicalError.header;
    const errorMessages: Array<string> =
      content[i18next.language].login.failed.technicalError.messages;
    messages.push(...errorMessages);
  } else if (statusCode === CONFLICT) {
    logger.info(`Found a non cor appeal for ${email}`);
    header = content[i18next.language].login.failed.cannotUseService.header;
    const errorMessages: Array<string> =
      content[i18next.language].login.failed.cannotUseService.messages;
    messages.push(...errorMessages);
  }
  return res.render('errors/error.njk', { header, messages });
}

function setupLoginController(deps: Dependencies) {
  const router = Router();
  router.get(
    Paths.login,
    getIdamCallback(
      redirectToIdam('/login', deps.idamService),
      deps.idamService,
      deps.caseService,
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
