const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import { getActiveStages, getStatus, setupStatusController } from 'app/server/controllers/status';
import * as Paths from 'app/server/paths';
import { oralAppealStages } from 'app/server/data/appealStages';
const appealReceived = require('../../mock/tribunals/data/oral/appealReceived');

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
      setupStatusController({});
      expect(getStub).to.have.been.calledWith(Paths.status);
    });
  });

  describe('getActiveStatus', () => {
    it('should return stages array with states', () => {
      const oralStages = oralAppealStages.map(stage => {
        if (stage.status === 'APPEAL_RECEIVED') return { ...stage, active: true };
        return { ...stage, active: false };
      });
      expect(getActiveStages('APPEAL_RECEIVED', oralAppealStages)).to.eql(oralStages);
    });
  });

  describe('getStatus', () => {
    it('should render 404 page when mya feature not enabled', async() => {
      getStatus(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });

    it('should render status page when mya feature enabled for oral (APPEAL_RECEIVED)', async() => {
      const stages = [
        {
          active: true,
          latestUpdateText: 'text',
          status: 'APPEAL_RECEIVED',
          title: 'Appeal'
        }, {
          active: false,
          latestUpdateText: 'text',
          status: 'DWP_RESPOND',
          title: 'DWP response'
        }, {
          active: false,
          latestUpdateText: 'text',
          status: 'HEARING_BOOKED',
          title: 'Hearing booked'
        }, {
          active: false,
          latestUpdateText: 'text',
          status: 'HEARING',
          title: 'Hearing'
        }
      ];
      req.cookies.manageYourAppeal = 'true';
      req.session = appealReceived;
      getStatus(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('status.html', { stages, appeal: appealReceived.appeal });
    });
  });
});
