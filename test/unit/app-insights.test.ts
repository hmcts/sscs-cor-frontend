const { expect, sinon } = require('test/chai-sinon');
import * as applicationInsights from 'applicationinsights';
import * as AppInsights from 'app/server/app-insights.ts';
const config = require('config');

describe('app-insights.js', () => {
  describe('enable', () => {
    const sb = sinon.sandbox.create();

    beforeEach(() => {
      sb.stub(applicationInsights, 'start');
    });

    afterEach(() => {
      sb.restore();
    });

    it('sets cloud role name', () => {
      AppInsights.enable();
      expect(applicationInsights.defaultClient.context.tags['ai.cloud.role']).to.equal(config.get('appInsights.roleName'));
    });

    it('should call start', () => {
      AppInsights.enable();
      // eslint-disable-next-line no-unused-expressions
      expect(applicationInsights.start).to.have.been.called;
    });
  });
});

export {};
