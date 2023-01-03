import * as applicationInsights from 'applicationinsights';
import * as AppInsights from 'app/server/app-insights';

const { expect, sinon } = require('test/chai-sinon');
const config = require('config');

describe('app-insights.js', function () {
  describe('enable', function () {
    beforeEach(function () {
      sinon.stub(applicationInsights, 'start');
    });

    afterEach(function () {
      sinon.restore();
    });

    it('sets cloud role name', function () {
      AppInsights.enable();
      expect(
        applicationInsights.defaultClient.context.tags['ai.cloud.role']
      ).to.equal(config.get('appInsights.roleName'));
    });

    it('should call start', function () {
      AppInsights.enable();
      // eslint-disable-next-line no-unused-expressions
      expect(applicationInsights.start).to.have.been.called;
    });
  });
});
