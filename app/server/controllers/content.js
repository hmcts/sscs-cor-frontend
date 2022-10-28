const { renderContent } = require('../../core/tyaNunjucks');
const content = require('../../../locale/content');
const i18next = require('i18next');

const emailNotifications = (req, res, next) => {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = content[i18next.language].notifications;
  content[i18next.language].notifications = renderContent(
    notificationsContent,
    placeholder
  );

  next();
};

module.exports = { emailNotifications };
