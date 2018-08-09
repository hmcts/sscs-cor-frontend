const { expect, sinon } = require('test/chai-sinon');
const applicationInsights = require('applicationinsights');
const { enable, trackException } = require('app-insights');
const config = require('config');

describe('app-insights.js', () => {



  describe('enable', () => {

    const sb = sinon.sandbox.create();

    after(() => {
      sb.restore();
    })


    let startStub = null;
    beforeEach(() => {
      sb.spy(config, 'get');
      startStub = sb.stub();
      sb.stub(applicationInsights, 'setup').withArgs('iKey')
        .returns({
          setAutoCollectConsole: sb.stub().withArgs(true, true)
            .returns({ start: startStub })
        });
    });

    afterEach(() => {
      // config.get.restore();
      // applicationInsights.setup.restore();
      // applicationInsights.setup('iKey').setAutoCollectConsole.restore();
      // sb.restore();
    })

    it('should call start', () => {
      enable();
      expect(startStub).to.have.been.called;
    });
  });
  describe('trackException', () => {

    const sb = sinon.sandbox.create();

    after(() => {
      sb.restore();
    })

    let trackStub;
    before(() => {
      enable();
    });
    beforeEach(() => {
      sb.stub(applicationInsights.defaultClient, 'trackException');
      // trackStub = sinon.stub(applicationInsights).returns({
      //   defaultClient: {
      //     trackException: sinon.stub()
      //   }
      // })
    });
    // afterEach(() => {
    //   trackStub.restore();
    // });
    it('should call trackException with the exception passed', () => {
      const exception = 'Exception Error';
      trackException(exception);
      expect(applicationInsights.defaultClient.trackException).to.have.been.calledWith({ exception });
    });
  });
});
