import * as AppInsights from '../../../app/server/app-insights';

import * as hearing from 'app/server/controllers/hearing';
import * as Paths from 'app/server/paths';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralHearing = require('../../mock/tribunals/data/oral/hearing');

describe('controllers/hearing', function () {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {},
      },
      cookies: {},
    } as any;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
    };

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(function () {
    sandbox.restore();
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  describe('setupHearingController', function () {
    let getStub;
    beforeEach(function () {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should call Router', function () {
      hearing.setupHearingController({});
      expect(getStub).to.have.been.calledWith(Paths.hearing);
    });
  });

  describe('getStatus', function () {
    it('should render status page when mya feature enabled for oral (APPEAL_RECEIVED)', async function () {
      req.session.appeal = oralHearing.appeal;
      const hearingArrangements = {
        disabled_access_required: true,
      };
      req.session.hearing = { hearing_arrangements: hearingArrangements };
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-tab.njk', {
        attending: true,
        hearingInfo: oralHearing.appeal.historicalEvents[0],
        hearingArrangements,
        appeal: oralHearing.appeal,
      });
    });

    it('should hide hearing info when appeal has hideHearing set to true', async function () {
      req.session.appeal = oralHearing.appeal;
      req.session.hideHearing = true;
      const hearingArrangements = {};
      req.session.hearing = { hearing_arrangements: hearingArrangements };
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-tab.njk', {
        attending: true,
        hearingInfo: null,
        hearingArrangements,
        appeal: oralHearing.appeal,
      });
    });

    it('should render status page when mya feature enabled for paper (APPEAL_RECEIVED)', async function () {
      req.session.appeal.hearingType = 'paper';
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-tab.njk', {
        attending: false,
        hearingArrangements: {},
        hearingInfo: undefined,
        appeal: req.session.appeal,
      });
    });

    it('should throw error if no sessions', async function () {
      req.session = null;

      expect(() => hearing.getHearing(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
