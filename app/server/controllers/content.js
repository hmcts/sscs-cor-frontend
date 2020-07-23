const { renderContent } = require('../../core/tyaNunjucks');
const content = require('../../../locale/content');

const emailNotifications = (req, res, next) => {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = content.en.notifications;
  content.en.notifications = renderContent(notificationsContent, placeholder);

  next();
};

module.exports = { emailNotifications };
