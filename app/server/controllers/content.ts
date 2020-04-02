const { renderContent } = require('../../core/tyaNunjucks');
const i18n = require('../../../locale/en.json');
import { Logger } from '@hmcts/nodejs-logging';

const emailNotifications = (req, res, next) => {
  const token = res.locals.token;
  const placeholder = { benefitType: token.benefitType };
  const notificationsContent = i18n.notifications;
  i18n.notifications = renderContent(notificationsContent, placeholder);

  next();
};

module.exports = { emailNotifications };
