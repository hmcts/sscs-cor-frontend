const { expect, sinon } = require('test/chai-sinon');
const applicationInsights = require('applicationinsights');
const { enable } = require('app-insights');

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
      enable();
      // eslint-disable-next-line no-unused-expressions
      expect(startStub).to.have.been.called;
    });
  });
});
