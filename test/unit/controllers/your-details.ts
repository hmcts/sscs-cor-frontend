import * as status from '../../../app/server/controllers/status';

import * as yourDetails from 'app/server/controllers/your-details';
import * as Paths from 'app/server/paths';
import * as AppInsights from '../../../app/server/app-insights';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');

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
    let getStub;
    beforeEach(function () {
      getStub = sinon.stub(express.Router, 'get');
    });

    afterEach(function () {
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
        { details: req.session.case }
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
