const router = require('express').Router();
const { Logger } = require('@hmcts/nodejs-logging');
const i18next = require('i18next');
const languages = require('config').languages;
const logger = Logger.getLogger('app-configuration.ts');

router.get('*', (req, res, next) => {
  logger.info(`Language currently set to ${i18next.language.toUpperCase()}`);

  if (!req.session.language) {
    req.session.language = 'en';
  } else if (req.query && req.query.lng && languages.includes(req.query.lng)) {
    logger.info(`Setting language to ${req.query.lng.toUpperCase()} from query string`);
    req.session.language = req.query.lng;
    i18next.changeLanguage(req.query.lng);
  } else {
    logger.info(`Setting language to ${req.session.language.toUpperCase()} from session`);
    i18next.changeLanguage(req.session.language);
  }

  next();
});

module.exports = router;
