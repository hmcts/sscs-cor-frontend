const types = require('../../core/notifications/types');
const HttpStatus = require('http-status-codes');

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
    res.render('manage-emails', {
      mactoken: req.params.mactoken,
      fields: {
        error: true,
        noSelection: {
          errorHeading: res.locals.i18n.notifications.email.errors.selectAnOptionHeading,
          errorMessage: res.locals.i18n.notifications.email.errors.selectAnOptionField
        }
      }
    });
  }

  next();
};

module.exports = { notificationRedirect };
