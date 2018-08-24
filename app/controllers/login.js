const { Logger } = require('@hmcts/nodejs-logging');
const appInsights = require('app-insights');
const express = require('express');
const { NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');
const paths = require('paths');
const i18n = require('app/locale/en.json');
const { loginEmailAddressValidation } = require('app/utils/fieldValidation');

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
    return res.redirect(paths.login);
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
      return res.redirect(paths.taskList);
    } catch (error) {
      appInsights.trackException(error);
      return next(error);
    }
  };
}

function setupLoginController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get(paths.login, getLogin);
  router.get(paths.logout, getLogout);
  router.post(paths.login, postLogin(deps.getOnlineHearingService));
  return router;
}

module.exports = {
  setupLoginController,
  getLogin,
  getLogout,
  postLogin
};
