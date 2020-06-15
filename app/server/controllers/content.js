const { renderContent } = require('../../core/tyaNunjucks');
const i18n = require('../../../locale/content');

const emailNotifications = (req, res, next) => {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = i18n.en.notifications;
  i18n.en.notifications = renderContent(notificationsContent, placeholder);

  next();
};

module.exports = { emailNotifications };
