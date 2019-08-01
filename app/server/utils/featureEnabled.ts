import * as config from 'config';

enum Feature {
  ADDITIONAL_EVIDENCE_FEATURE = 'additionalEvidence',
  MANAGE_YOUR_APPEAL = 'manageYourAppeal',
  TEST_FEATURE = 'testFeature',
  ALLOW_CONTACT_US = 'allowContactUs.enabled',
  CONTACT_US_WEB_FORM_ENABLED = 'allowContactUs.webFormEnabled',
  CONTACT_US_TELEPHONE_ENABLED = 'allowContactUs.telephoneEnabled',
  CONTACT_US_WEBCHAT_ENABLED= 'allowContactUs.webChatEnabled'
}

function isFeatureEnabled(feature: Feature, force?: {}): boolean {
  if (!config.has(`featureFlags.${feature}`)) return false;
  if (force && force[`${feature}`] === 'true') {
    return true;
  } else {
    const enabled = config.get(`featureFlags.${feature}`) === 'true';
    return enabled;
  }
}

export {
  isFeatureEnabled,
  Feature
};
