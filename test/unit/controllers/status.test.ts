const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as status from 'app/server/controllers/status';
import * as Paths from 'app/server/paths';
import * as appealStagesUtils from 'app/server/utils/appealStages';
const oralAppealReceived = require('../../mock/tribunals/data/oral/appealReceived');
const paperAppealReceived = require('../../mock/tribunals/data/paper/appealReceived');

describe('controllers/status', () => {
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

  describe('setupStatusController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      status.setupStatusController({});
      expect(getStub).to.have.been.calledWith(Paths.status);
    });
  });

  describe('getStatus', () => {
    it('should render 404 page when mya feature not enabled', async() => {
      status.getStatus(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });

    it('should render status page when mya feature enabled for oral (APPEAL_RECEIVED)', async() => {
      req.cookies.manageYourAppeal = 'true';
      req.session = oralAppealReceived;
      const getActiveStagesStub = sandbox.stub(appealStagesUtils, 'getActiveStages').returns([]);
      status.getStatus(req, res);
      expect(getActiveStagesStub).to.have.been.calledOnce.calledWith(oralAppealReceived.appeal.status);
      expect(res.render).to.have.been.calledOnce.calledWith('status-tab.html', { stages: [], appeal: oralAppealReceived.appeal });
    });

    it('should render status page when mya feature enabled for paper (APPEAL_RECEIVED)', async() => {
      req.cookies.manageYourAppeal = 'true';
      req.session = paperAppealReceived;
      const getActiveStagesStub = sandbox.stub(appealStagesUtils, 'getActiveStages').returns([]);
      status.getStatus(req, res);
      expect(getActiveStagesStub).to.have.been.calledOnce.calledWith(paperAppealReceived.appeal.status);
      expect(res.render).to.have.been.calledOnce.calledWith('status-tab.html', { stages: [], appeal: paperAppealReceived.appeal });
    });
  });
});
