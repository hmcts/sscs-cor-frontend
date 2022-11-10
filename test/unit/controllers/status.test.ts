import * as hearing from '../../../app/server/controllers/hearing';

import * as status from 'app/server/controllers/status';
import * as Paths from 'app/server/paths';
import * as appealStagesUtils from 'app/server/utils/appealStages';
import * as AppInsights from '../../../app/server/app-insights';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralAppealReceived = require('../../mock/tribunals/data/oral/appealReceived');
const paperAppealReceived = require('../../mock/tribunals/data/paper/appealReceived');

describe('controllers/status', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
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

  afterEach(() => {
    sandbox.restore();
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
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
    it('should render status page when mya feature enabled for oral (APPEAL_RECEIVED)', async () => {
      req.session = oralAppealReceived;
      const getActiveStagesStub = sandbox
        .stub(appealStagesUtils, 'getActiveStages')
        .returns([]);
      status.getStatus(req, res);
      expect(getActiveStagesStub).to.have.been.calledOnce.calledWith(
        oralAppealReceived.appeal.status
      );
      expect(res.render).to.have.been.calledOnce.calledWith('status-tab.njk', {
        stages: [],
        appeal: oralAppealReceived.appeal,
      });
    });

    it('should render status page when mya feature enabled for paper (APPEAL_RECEIVED)', async () => {
      req.session = paperAppealReceived;
      const getActiveStagesStub = sandbox
        .stub(appealStagesUtils, 'getActiveStages')
        .returns([]);
      status.getStatus(req, res);
      expect(getActiveStagesStub).to.have.been.calledOnce.calledWith(
        paperAppealReceived.appeal.status
      );
      expect(res.render).to.have.been.calledOnce.calledWith('status-tab.njk', {
        stages: [],
        appeal: paperAppealReceived.appeal,
      });
    });

    it('should throw error if no sessions', async () => {
      req.session = null;

      expect(() => status.getStatus(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
