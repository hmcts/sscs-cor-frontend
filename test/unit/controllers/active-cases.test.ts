import * as activeCases from 'app/server/controllers/active-cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from '../../../app/server/app-insights';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralActiveAndDormantCases = require('../../mock/tribunals/data/oral/activeAndDormantCases.json');

describe('controllers/active-cases', () => {
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

  describe('setupActiveCasesController', () => {
    let getStub;
    beforeEach(() => {
      getStub = sandbox.stub(express.Router, 'get');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call Router', () => {
      activeCases.setupActiveCasesController({});
      expect(getStub).to.have.been.calledWith(Paths.activeCases);
    });
  });

  describe('getActiveCases', () => {
    it('should render active cases page', async () => {
      req.session['hearings'] = oralActiveAndDormantCases;
      activeCases.getActiveCases(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('active-tab.njk');
    });

    it('should throw error if no sessions', async () => {
      req.session = null;

      expect(() => activeCases.getActiveCases(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
