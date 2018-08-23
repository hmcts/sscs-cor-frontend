const { Logger } = require('@hmcts/nodejs-logging');
const appInsights = require('app-insights');
const express = require('express');
const { NOT_FOUND } = require('http-status-codes');
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
      if (response.status === NOT_FOUND) {
        logger.info(`Online hearing not found for ${email}`);
        const emailAddress = {
          value: email,
          error: i18n.login.emailAddress.error.notFound
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
