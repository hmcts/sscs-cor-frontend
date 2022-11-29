import * as applicationInsights from 'applicationinsights';
import * as AppInsights from 'app/server/app-insights';
import { SinonSandbox } from 'sinon';

const { expect, sinon } = require('test/chai-sinon');
const config = require('config');

describe('app-insights.js', function () {
  describe('enable', function () {
    let sb: SinonSandbox = null;

    before(function () {
      sb = sinon.createSandbox();
    });

    beforeEach(function () {
      sb.stub(applicationInsights, 'start');
    });

    afterEach(function () {
      sb.restore();
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
