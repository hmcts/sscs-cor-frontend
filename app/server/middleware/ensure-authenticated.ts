const { Logger } = require('@hmcts/nodejs-logging');
const i18next = require('i18next');
import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';
const content = require('../../../locale/content');

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
  res.locals.featureFlags[Feature.MEDIA_FILES_ALLOWED_ENABLED] = isFeatureEnabled(Feature.MEDIA_FILES_ALLOWED_ENABLED, req.cookies);

  // Setting up Tabs to show on MYA;
  if (isFeatureEnabled(Feature.MANAGE_YOUR_APPEAL, req.cookies) && req.session.appeal && req.session.appeal.hearingType !== 'cor') {
    const hearingOutcomeTab = isFeatureEnabled(Feature.HEARING_OUTCOME_TAB, req.cookies);
    const avEvidenceTab = isFeatureEnabled(Feature.MEDIA_FILES_ALLOWED_ENABLED, req.cookies);
    res.locals.tabs = setTabNavigationItems(req.session.appeal, hearingOutcomeTab, avEvidenceTab);
  }
  next();
}

function setTabNavigationItems(appeal, hearingOutcomeTab, avEvidenceTab) {
  const { hearingType } = appeal;
  const { createdInGapsFrom } = appeal;
  const tabs = [
    {
      'id': 'status',
      'title': content[i18next.language].statusTab.tabHeader,
      'url': '/status'
    },
    {
      'id': 'questions',
      'title': content[i18next.language].provideEvidenceTab.tabHeader,
      'url': '/task-list'
    },
    {
      'id': 'hearing',
      'title': content[i18next.language].hearingTab.tabHeader,
      'url': '/hearing'
    },
    {
      'id': 'history',
      'title': content[i18next.language].historyTab.tabHeader,
      'url': '/history'
    },
    {
      'id': 'outcome',
      'title': content[i18next.language].outcomeTab.tabHeader,
      'url': '/outcome'
    },
    {
      'id': 'avEvidence',
      'title': content[i18next.language].avEvidenceTab.tabHeader,
      'url': '/av-evidence-list'
    }
  ];
  let tabsToShow = hearingType === 'cor' ? tabs.filter(tab => tab.title !== content[i18next.language].hearingTab.tabHeader) : tabs;

  tabsToShow = (createdInGapsFrom !== 'readyToList' && hearingType !== 'cor') ? tabsToShow.filter(tab => tab.title !== content[i18next.language].provideEvidenceTab.tabHeader) : tabs;
  tabsToShow = tabsToShow.filter(tab => tab.id !== 'history');
  tabsToShow = (!appeal.hearingOutcome || !hearingOutcomeTab) ? tabsToShow.filter(tab => tab.id !== 'outcome') : tabsToShow;
  tabsToShow = (!avEvidenceTab) ? tabsToShow.filter(tab => tab.id !== 'avEvidence') : tabsToShow;
  return tabsToShow;
}

const ensureAuthenticated = [checkAccessToken, setLocals];
export {
  checkAccessToken,
  setLocals,
  ensureAuthenticated
};
