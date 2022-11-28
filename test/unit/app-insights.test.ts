import * as applicationInsights from 'applicationinsights';
import * as AppInsights from 'app/server/app-insights';

const { expect, sinon } = require('test/chai-sinon');
const config = require('config');

describe('app-insights.js', () => {
  describe('enable', () => {
    const sb = sinon.createSandbox();

    beforeEach(() => {
      sb.stub(applicationInsights, 'start');
    });

    afterEach(() => {
      sb.restore();
    });

    it('sets cloud role name', () => {
      AppInsights.enable();
      expect(
        applicationInsights.defaultClient.context.tags['ai.cloud.role']
      ).to.equal(config.get('appInsights.roleName'));
    });

    it('should call start', () => {
      AppInsights.enable();
      // eslint-disable-next-line no-unused-expressions
      expect(applicationInsights.start).to.have.been.called;
    });
  });
});

export {};
