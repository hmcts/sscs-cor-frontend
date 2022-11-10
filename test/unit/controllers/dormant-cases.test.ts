import * as dormantCases from 'app/server/controllers/dormant-cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from '../../../app/server/app-insights';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralActiveAndDormantCases = require('../../mock/tribunals/data/oral/activeAndDormantCases.json');

describe('controllers/dormant-cases', () => {
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

  describe('setupDormantCasesController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      dormantCases.setupDormantCasesController({});
      expect(getStub).to.have.been.calledWith(Paths.dormantCases);
    });
  });

  describe('getDormantCases', () => {
    it('should render dormant cases page', async () => {
      req.session['hearings'] = oralActiveAndDormantCases;
      dormantCases.getDormantCases(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('dormant-tab.njk');
    });

    it('should throw error if no sessions', async () => {
      req.session = null;

      expect(() => dormantCases.getDormantCases(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
