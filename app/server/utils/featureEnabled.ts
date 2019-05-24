import * as config from 'config';

enum Feature {
  ADDITIONAL_EVIDENCE_FEATURE = 'additionalEvidence',
  MANAGE_YOUR_APPEAL = 'manageYourAppeal',
  TEST_FEATURE = 'testFeature'
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
