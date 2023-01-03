import * as cases from 'app/server/controllers/cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import oralCases from '../../mock/tribunals/data/oral/activeAndDormantCases.json';
import { SinonStub } from 'sinon';

describe('controllers/cases', function () {
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

  describe('setupCasesController', function () {
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
      cases.setupCasesController({});
      expect(getStub).to.have.been.calledWith(Paths.selectCase);
    });
  });

  describe('getCases', function () {
    it('should render cases page', async function () {
      req.session.cases = oralCases;
      cases.getCases(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('cases.njk');
    });

    it('should throw error if no sessions', async function () {
      req.session = null;

      expect(() => cases.getCases(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
