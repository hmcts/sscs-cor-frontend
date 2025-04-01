import * as yourDetails from 'app/server/controllers/your-details';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';

import express, { Router } from 'express';

import { expect, sinon } from 'test/chai-sinon';
import { SinonStub } from 'sinon';

describe('controllers/your-details', function () {
  let req: any;
  let res: any;

  beforeEach(function () {
    req = {
      session: {
        appeal: {},
        case: {
          user_details: {},
        },
        subscriptions: {
          appellant: {},
        },
      },
      cookies: {},
    } as any;

    res = {
      render: sinon.stub(),
      send: sinon.stub(),
    };

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('setupYourDetailsController', function () {
    let getStub: SinonStub = null;

    before(function () {
      getStub = sinon.stub();
      sinon.stub(express, 'Router').returns({
        get: getStub,
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('should call Router', function () {
      yourDetails.setupYourDetailsController({});
      expect(getStub).to.have.been.calledWith(Paths.yourDetails);
    });
  });

  describe('getYourDetails', function () {
    it('should render your details page when mya feature enabled', async function () {
      yourDetails.getYourDetails(req, res);

      expect(res.render).to.have.been.calledOnce.calledWith(
        'your-details.njk',
        { details: req.session.case, appeal: req.session.appeal }
      );
    });

    it('should throw error if no sessions', async function () {
      req.session = null;

      expect(() => yourDetails.getYourDetails(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
