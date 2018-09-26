const { expect, sinon } = require('test/chai-sinon');
import * as applicationInsights from 'applicationinsights';
import * as AppInsights from 'app/server/app-insights.ts';

describe('app-insights.js', () => {
  describe('enable', () => {
    const sb = sinon.sandbox.create();
    let startStub = null;

    beforeEach(() => {
      startStub = sb.stub();
      sb.stub(applicationInsights, 'setup').withArgs('iKey')
        .returns({
          setAutoCollectConsole: sb.stub().withArgs(true, true)
            .returns({ start: startStub })
        });
    });

    afterEach(() => {
      sb.restore();
    });

    it('should call start', () => {
      AppInsights.enable();
      // eslint-disable-next-line no-unused-expressions
      expect(startStub).to.have.been.called;
    });
  });
});

export {};