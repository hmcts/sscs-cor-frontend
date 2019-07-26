const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralHearing = require('../../mock/tribunals/data/oral/hearing');
import * as hearing from 'app/server/controllers/hearing';
import * as Paths from 'app/server/paths';

describe('controllers/hearing', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {
        appeal: {}
      },
      cookies: {}
    } as any;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      hearing.setupHearingController({});
      expect(getStub).to.have.been.calledWith(Paths.hearing);
    });
  });

  describe('getStatus', () => {
    it('should render 404 page when mya feature not enabled', async() => {
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });

    it('should render status page when mya feature enabled for oral (APPEAL_RECEIVED)', async() => {
      req.cookies.manageYourAppeal = 'true';
      req.session.appeal = oralHearing.appeal;
      const hearingArrangements = {
        disabled_access_required: true
      };
      req.session.hearing = { hearing_arrangements: hearingArrangements };
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-tab.html', { attending: true, hearingInfo: oralHearing.appeal.historicalEvents[0], hearingArrangements });
    });

    it('should render status page when mya feature enabled for paper (APPEAL_RECEIVED)', async() => {
      req.cookies.manageYourAppeal = 'true';
      req.session.appeal.hearingType = 'paper';
      hearing.getHearing(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-tab.html', { attending: false, hearingArrangements: {}, hearingInfo: undefined });
    });
  });
});
