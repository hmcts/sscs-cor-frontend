const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

const logger = Logger.getLogger('ensure-authenticated.js');

function checkAccessToken(req, res, next) {
  if (req.session.accessToken) {
    return next();
  }
  const sessionId = req.session.id;
  req.session.destroy(error => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function setLocals(req, res, next) {
  if (req.session.accessToken) {
    res.locals.hearing = req.session.hearing;
    res.locals.showSignOut = true;
  }

  // Retrieve feature Flags and adding them as local variables so views can easily access to them
  res.locals.featureFlags = {};
  res.locals.featureFlags[Feature.MANAGE_YOUR_APPEAL] = isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies);
  res.locals.featureFlags[Feature.ADDITIONAL_EVIDENCE_FEATURE] = isFeatureEnabled(Feature.ADDITIONAL_EVIDENCE_FEATURE, req.cookies);

  // Setting up Tabs to show on MYA;
  if (isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies)) {
    res.locals.tabs = setTabNavigationItems(req.session.appeal);
  }
  next();
}

function setTabNavigationItems(appeal) {
  const { hearingType } = appeal;
  const tabs = [
    {
      'id': 'status',
      'title': 'Status',
      'url': '/status'
    },
    {
      'id': 'questions',
      'title': 'Provide Evidence',
      'url': '/task-list'
    },
    {
      'id': 'hearing',
      'title': 'Hearing',
      'url': '/hearing'
    },
    {
      'id': 'history',
      'title': 'History',
      'url': '/history'
    }
  ];
  const tabsToShow = hearingType === 'cor' ? tabs.filter(tab => tab.title !== 'Hearing') : tabs;
  return tabsToShow;
}

const ensureAuthenticated = [checkAccessToken, setLocals];

export {
  checkAccessToken,
  setLocals,
  ensureAuthenticated
};
