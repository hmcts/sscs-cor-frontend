import * as status from '../../../app/server/controllers/status';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as yourDetails from 'app/server/controllers/your-details';
import * as Paths from 'app/server/paths';
import * as AppInsights from '../../../app/server/app-insights';

describe('controllers/your-details', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {
        appeal: {},
        hearing: {
          user_details: {}
        },
        subscriptions: {
          appellant: {}
        }
      },
      cookies: {}
    } as any;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    };

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(() => {
    sandbox.restore();
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  describe('setupYourDetailsController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      yourDetails.setupYourDetailsController({});
      expect(getStub).to.have.been.calledWith(Paths.yourDetails);
    });
  });

  describe('getYourDetails', () => {
    it('should render your details page when mya feature enabled', async() => {
      yourDetails.getYourDetails(req, res);

      expect(res.render).to.have.been.calledOnce.calledWith('your-details.html', { details: req.session.hearing });
    });

    it('should throw error if no sessions', async() => {
      req.session = null;

      expect(() => yourDetails.getYourDetails(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(sinon.match.has('message', error.message));
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
