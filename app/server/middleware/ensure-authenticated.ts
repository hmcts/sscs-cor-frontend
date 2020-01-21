const { Logger } = require('@hmcts/nodejs-logging');
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
const i18n = require('../../../locale/en');

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

  res.locals.inDashboard = ['/status', '/task-list', '/history', '/hearing'].includes(req.originalUrl);

  // Retrieve feature Flags and adding them as local variables so views can easily access to them
  res.locals.featureFlags = {};
  res.locals.featureFlags[Feature.MANAGE_YOUR_APPEAL] = isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies) && req.session.appeal && req.session.appeal.hearingType !== 'cor';
  res.locals.featureFlags[Feature.ADDITIONAL_EVIDENCE_FEATURE] = isFeatureEnabled(Feature.ADDITIONAL_EVIDENCE_FEATURE, req.cookies);

  // Setting up Tabs to show on MYA;
  if (isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies) && req.session.appeal && req.session.appeal.hearingType !== 'cor') {
    res.locals.tabs = setTabNavigationItems(req.session.appeal);
  }
  next();
}

function setTabNavigationItems(appeal) {
  const { hearingType } = appeal;
  const { createdInGapsFrom } = appeal;
  const tabs = [
    {
      'id': 'status',
      'title': i18n.statusTab.tabHeader,
      'url': '/status'
    },
    {
      'id': 'questions',
      'title': i18n.provideEvidenceTab.tabHeader,
      'url': '/task-list'
    },
    {
      'id': 'hearing',
      'title': i18n.hearingTab.tabHeader,
      'url': '/hearing'
    },
    {
      'id': 'history',
      'title': i18n.historyTab.tabHeader,
      'url': '/history'
    }
  ];
  let tabsToShow = hearingType === 'cor' ? tabs.filter(tab => tab.title !== 'Hearing') : tabs;

  tabsToShow = (createdInGapsFrom !== 'readyToList' && hearingType !== 'cor') ? tabsToShow.filter(tab => tab.title !== 'Provide Evidence') : tabs;
  tabsToShow = tabsToShow.filter(tab => tab.id !== 'history');
  return tabsToShow;
}

const ensureAuthenticated = [checkAccessToken, setLocals];

export {
  checkAccessToken,
  setLocals,
  ensureAuthenticated
};
