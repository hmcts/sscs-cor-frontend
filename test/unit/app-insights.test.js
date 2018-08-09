const { expect, sinon } = require('test/chai-sinon');
const applicationInsights = require('applicationinsights');
const { enable, trackException } = require('app-insights');
const config = require('config');

describe.only('app-insights.js', () => {
  describe('trackException', () => {
    beforeEach(() => {
      applicationInsights.defaultClient = {
        trackException: sinon.stub()
      };
    });

    it('should call trackException with the exception passed', () => {
      const exception = 'Exception Error';
      trackException(exception);
      expect(applicationInsights.defaultClient.trackException).to.have.been.calledWith({
        exception
      });
    });
  });
  describe('enable', () => {
    let startStub = null;
    beforeEach(() => {
      sinon.spy(config, 'get');
      startStub = sinon.stub();
      sinon.stub(applicationInsights, 'setup').withArgs('iKey')
        .returns({
          setAutoCollectConsole: sinon.stub().withArgs(true, true)
            .returns({ start: startStub })
        });
    });

    it('should call start', () => {
      enable();
      expect(startStub).to.have.been.called;
    });
  });
});
