const { renderContent } = require('../../core/tyaNunjucks');

const emailNotifications = (req, res, next) => {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = res.locals.i18n.notifications;
  res.locals.i18n.notifications = renderContent(notificationsContent, placeholder);

  next();
};

module.exports = { emailNotifications };
