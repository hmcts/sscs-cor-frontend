import * as Paths from '../paths';
import { isFeatureEnabled, Feature } from '../utils/featureEnabled';

import { Logger } from '@hmcts/nodejs-logging';
import i18next from 'i18next';
import content from '../../common/locale/content.json';

const logger = Logger.getLogger('ensure-authenticated.js');

function checkAccessToken(req, res, next) {
  if (req.session.accessToken) {
    return next();
  }
  const sessionId = req.session.id;
  req.session.destroy((error) => {
    if (error) {
      logger.error(`Error destroying session ${sessionId}`);
    }
    logger.info(`Session destroyed ${sessionId}`);
    return res.redirect(Paths.login);
  });
}

function setLocals(req, res, next) {
  if (req.session.accessToken) {
    if (req.session.case) {
      res.locals.case = req.session.case;
      res.locals.caseSelected = true;
    } else {
      res.locals.caseSelected = false;
    }
    res.locals.signedIn = true;
  }

  res.locals.inDashboard = [
    '/status',
    '/task-list',
    '/history',
    '/hearing',
  ].includes(req.originalUrl);

  // Retrieve feature Flags and adding them as local variables so views can easily access to them
  res.locals.featureFlags = {};

  // Setting up Main Tabs to show on MYA;
  const myaPagination = isFeatureEnabled(
    Feature.MYA_PAGINATION_ENABLED,
    req.cookies
  );
  if (req.session.cases && myaPagination) {
    res.locals.mainTabs = setMainTabNavigationItems();
  }

  // Setting up Tabs to show on MYA;
  if (req.session.appeal) {
    const hearingOutcomeTab = true;
    const avEvidenceTab = true;
    const requestTab = isFeatureEnabled(
      Feature.REQUEST_TAB_ENABLED,
      req.cookies
    );
    res.locals.tabs = setTabNavigationItems(
      req.session.appeal,
      hearingOutcomeTab,
      avEvidenceTab,
      requestTab
    );
  }
  next();
}

function setMainTabNavigationItems() {
  const tabs = [
    {
      id: 'activeTab',
      title: content[i18next.language].activeTab.tabHeader,
      url: '/active-cases',
    },
    {
      id: 'dormantTab',
      title: content[i18next.language].dormantTab.tabHeader,
      url: '/dormant-cases',
    },
  ];
  return tabs;
}

function setTabNavigationItems(
  appeal,
  hearingOutcomeTab,
  avEvidenceTab,
  requestTab
) {
  const { hearingType } = appeal;
  const { createdInGapsFrom } = appeal;
  const tabs = [
    {
      id: 'status',
      title: content[i18next.language].statusTab.tabHeader,
      url: '/status',
    },
    {
      id: 'questions',
      title: content[i18next.language].provideEvidenceTab.tabHeader,
      url: '/task-list',
    },
    {
      id: 'hearing',
      title: content[i18next.language].hearingTab.tabHeader,
      url: '/hearing',
    },
    {
      id: 'history',
      title: content[i18next.language].historyTab.tabHeader,
      url: '/history',
    },
    {
      id: 'outcome',
      title: content[i18next.language].outcomeTab.tabHeader,
      url: '/outcome',
    },
    {
      id: 'avEvidence',
      title: content[i18next.language].avEvidenceTab.tabHeader,
      url: '/av-evidence-list',
    },
    {
      id: 'requestType',
      title: content[i18next.language].requestTypeTab.tabHeader,
      url: '/request-type',
    },
  ];
  let tabsToShow =
    hearingType === 'cor'
      ? tabs.filter(
          (tab) => tab.title !== content[i18next.language].hearingTab.tabHeader
        )
      : tabs;

  tabsToShow =
    createdInGapsFrom !== 'readyToList' && hearingType !== 'cor'
      ? tabsToShow.filter(
          (tab) =>
            tab.title !== content[i18next.language].provideEvidenceTab.tabHeader
        )
      : tabs;
  tabsToShow = tabsToShow.filter((tab) => tab.id !== 'history');
  tabsToShow =
    !appeal.hearingOutcome || !hearingOutcomeTab
      ? tabsToShow.filter((tab) => tab.id !== 'outcome')
      : tabsToShow;
  tabsToShow = avEvidenceTab
    ? tabsToShow
    : tabsToShow.filter((tab) => tab.id !== 'avEvidence');
  tabsToShow = requestTab
    ? tabsToShow
    : tabsToShow.filter((tab) => tab.id !== 'requestType');
  return tabsToShow;
}

const ensureAuthenticated = [checkAccessToken, setLocals];
export { checkAccessToken, setLocals, ensureAuthenticated };
