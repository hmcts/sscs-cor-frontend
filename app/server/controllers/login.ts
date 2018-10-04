import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { Request, Response, NextFunction, Router } from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import * as Paths from '../paths';
const i18n = require('../../../locale/en');
import { loginEmailAddressValidation } from '../utils/fieldValidation';
import { OnlineHearing } from '../services/getOnlineHearing';
import { CONST } from '../../constants'

const logger = Logger.getLogger('login.js');

function getLogin(req: Request, res: Response) {
  return res.render('login.html');
}

function getLogout(req: Request, res: Response) {
  const sessionId = req.session.id;
  req.session.destroy(error => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function postLogin(getOnlineHearing) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const email = req.body['email-address'];
    const validationMessage = loginEmailAddressValidation(email);
    if (validationMessage) {
      const emailAddress = {
        value: email,
        error: validationMessage
      };
      return res.render('login.html', { emailAddress });
    }
    try {
      const response = await getOnlineHearing(email);
      if (response.status === NOT_FOUND || response.status === UNPROCESSABLE_ENTITY) {
        logger.info(`Know issue trying to find hearing for ${email}, status ${response.status}`);
        const emailAddress = {
          value: email,
          error: i18n.login.emailAddress.error[`error${response.status}`]
        };
        return res.render('login.html', { emailAddress });
      }
      const hearing: OnlineHearing = response.body;
      req.session.hearing = hearing;
      logger.info(`Logging in ${email}`);
      if (hearing.decision && hearing.decision.decision_state === CONST.DECISION_ISSUED_STATE) {
        logger.info(`Decision issued for hearing with ID ${hearing.online_hearing_id}`);
        return res.redirect(Paths.decision);
      }
      return res.redirect(Paths.taskList);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function setupLoginController(deps) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.login, getLogin);
  router.get(Paths.logout, getLogout);
  router.post(Paths.login, postLogin(deps.getOnlineHearing));
  return router;
}

export {
  setupLoginController,
  getLogin,
  getLogout,
  postLogin
};
