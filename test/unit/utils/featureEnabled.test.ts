const { expect } = require('test/chai-sinon');
import * as config from 'config';
import { isFeatureEnabled, Feature } from '../../../app/server/utils/featureEnabled';

describe('#featureEnabled', () => {
  it('should return whether a feature is enabled', () => {
    const testFeature = config.get('featureFlags.testFeature') === true;
    expect(isFeatureEnabled(Feature.TEST_FEATURE)).to.equal(testFeature);
  });

  it('should return true if cookie is present', () => {
    const cookies = { testFeature: 'true' };
    const testFeature = config.get('featureFlags.testFeature') === true;
    expect(isFeatureEnabled(Feature.TEST_FEATURE, cookies)).to.equal(true || testFeature);
  });
});
