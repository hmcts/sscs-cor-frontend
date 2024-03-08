import config from 'config';

enum Feature {
  TEST_FEATURE = 'testFeature',
  ALLOW_CONTACT_US = 'allowContactUs.enabled',
  CONTACT_US_WEB_FORM_ENABLED = 'allowContactUs.webFormEnabled',
  CONTACT_US_TELEPHONE_ENABLED = 'allowContactUs.telephoneEnabled',
  CONTACT_US_WEBCHAT_ENABLED = 'allowContactUs.webChatEnabled',
  POST_BULK_SCAN = 'postBulkScan',
  HISTORY_TAB = 'historyTab',
  HEARING_OUTCOME_TAB = 'hearingOutcomeTab',
  REQUEST_TAB_ENABLED = 'requestTabEnabled',
  MEDIA_FILES_ALLOWED_ENABLED = 'mediaFilesAllowed',
  MYA_PAGINATION_ENABLED = 'myaPagination',
  ALLOW_COOKIE_BANNER_ENABLED = 'cookieBanner.enabled',
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isFeatureEnabled(feature: Feature, force?: {}): boolean {
  if (!config.has(`featureFlags.${feature}`)) return false;
  if (
    force &&
    (force[`${feature}`] === 'true' || force[`${feature}`] === 'false')
  ) {
    return force[`${feature}`] === 'true';
  }
  const enabled = config.get(`featureFlags.${feature}`) === 'true';
  return enabled;
}

export { isFeatureEnabled, Feature };
