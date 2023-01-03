import * as appInsights from 'applicationinsights';
import { enable } from 'app/server/app-insights';
import { expect, sinon } from 'test/chai-sinon';
import config from 'config';

const roleName: string = config.get('appInsights.roleName');

describe('app-insights.js', function () {
  describe('enable', function () {
    before(function () {
      sinon.stub(appInsights, 'start');
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('sets cloud role name', function () {
      enable();
      expect(appInsights.defaultClient.context.tags['ai.cloud.role']).to.equal(
        roleName
      );
    });

    it('should call start', function () {
      enable();
      expect(appInsights.start).to.have.been.calledOnceWith();
    });
  });
});
