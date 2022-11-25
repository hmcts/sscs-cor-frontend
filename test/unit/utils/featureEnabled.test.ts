import config from 'config';
import { isFeatureEnabled, Feature } from 'app/server/utils/featureEnabled';

const { expect } = require('test/chai-sinon');

describe('#featureEnabled', function () {
  it('should return whether a feature is enabled', function () {
    const testFeature = config.get('featureFlags.testFeature') === true;
    expect(isFeatureEnabled(Feature.TEST_FEATURE)).to.equal(testFeature);
  });

  it('should return true if cookie is present', function () {
    const cookies = { testFeature: 'true' };
    const testFeature = config.get('featureFlags.testFeature') === true;
    expect(isFeatureEnabled(Feature.TEST_FEATURE, cookies)).to.equal(
      true || testFeature
    );
  });
});
