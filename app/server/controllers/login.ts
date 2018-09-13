import { Logger } from '@hmcts/nodejs-logging';
import { AppInsights } from 'app/server/app-insights';
import { Router} from 'express';
import { NOT_FOUND, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { Paths } from 'app/server/paths';
const i18n = require('app/server/locale/en.json');
import { loginEmailAddressValidation } from 'app/server/utils/fieldValidation';

const logger = Logger.getLogger('login.js');

function getLogin(req, res) {
  return res.render('login.html');
}

function getLogout(req, res) {
  const sessionId = req.session.id;
  req.session.destroy(error => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function postLogin(getOnlineHearingService) {
  return async(req, res, next) => {
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
      const response = await getOnlineHearingService(email);
      if (response.status === NOT_FOUND || response.status === UNPROCESSABLE_ENTITY) {
        logger.info(`Know issue trying to find hearing for ${email}, status ${response.status}`);
        const emailAddress = {
          value: email,
          
          error: i18n.login.emailAddress.error[`error${response.status}`]
        };
        return res.render('login.html', { emailAddress });
      }
      req.session.hearing = response.body;
      logger.info(`Logging in ${email}`);
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
  router.post(Paths.login, postLogin(deps.getOnlineHearingService));
  return router;
}

export {
  setupLoginController,
  getLogin,
  getLogout,
  postLogin
};
