const router = require('express').Router();
const { Logger } = require('@hmcts/nodejs-logging');
const i18next = require('i18next');
const languages = require('config').languages;
const logger = Logger.getLogger('app-configuration.ts');

router.get('*', (req, res, next) => {
  if (!req.session.language) {
    req.session.language = 'en';
  } else if (req.query && req.query.lng && languages.includes(req.query.lng)) {
    req.session.language = req.query.lng;
    i18next.changeLanguage(req.query.lng);
  } else {
    i18next.changeLanguage(req.session.language);
  }

  next();
});

module.exports = router;
