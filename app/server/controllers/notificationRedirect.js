const types = require('../../core/notifications/types');
const HttpStatus = require('http-status-codes');
const content = require('../../../locale/content');
const i18next = require('i18next');

const notificationRedirect = (req, res, next) => {
  switch (req.body.type) {
    case types.CHANGE_EMAIL:
      res.redirect(`/manage-email-notifications/${req.params.mactoken}/change`);
      break;
    case types.STOP_EMAIL:
      res.redirect(`/manage-email-notifications/${req.params.mactoken}/stop`);
      break;
    default:
      res.status(HttpStatus.BAD_REQUEST);
      res.render('manage-emails.njk', {
        mactoken: req.params.mactoken,
        fields: {
          error: true,
          noSelection: {
            errorHeading:
              content[i18next.language].notifications.email.errors
                .selectAnOptionHeading,
            errorMessage:
              content[i18next.language].notifications.email.errors
                .selectAnOptionField,
          },
        },
      });
  }

  next();
};

module.exports = { notificationRedirect };
