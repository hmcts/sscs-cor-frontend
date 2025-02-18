import * as AppInsights from 'app/server/app-insights';
import * as hearing from 'app/server/controllers/hearing';
import * as Paths from 'app/server/paths';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import oralHearing from '../../mock/tribunals/data/oral/hearing.json';
import { SinonStub } from 'sinon';

describe('controllers/hearing', function () {
  let req: any;
  let res: any;

  beforeEach(function () {
    req = {
      session: {
        appeal: {},
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

  describe('setupHearingController', function () {
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
      req.session.case = { hearing_arrangements: hearingArrangements };
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
      req.session.appeal.hideHearing = true;
      const hearingArrangements = {};
      req.session.case = { hearing_arrangements: hearingArrangements };
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
