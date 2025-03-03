import * as activeCases from 'app/server/controllers/active-cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';
import express, { Router, Request, Response } from 'express';
import { expect, sinon } from 'test/chai-sinon';

import oralActiveAndDormantCases from '../../mock/tribunals/data/oral/activeAndDormantCases.json';
import { SinonStub } from 'sinon';

describe('controllers/active-cases', function () {
  let req: Request = null;
  let res: Response = null;

  beforeEach(function () {
    req = {
      session: {
        appeal: {},
      },
      cookies: {},
    } as Request;

    res = {
      render: sinon.stub(),
      send: sinon.stub(),
    } as Partial<Response> as Response;

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('setupActiveCasesController', function () {
    let getStub: SinonStub = null;

    beforeEach(function () {
      getStub = sinon.stub();
      sinon.stub(express, 'Router').returns({
        get: getStub,
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should call Router', function () {
      activeCases.setupActiveCasesController({});
      expect(getStub).to.have.been.calledWith(Paths.activeCases);
    });
  });

  describe('getActiveCases', function () {
    it('should render active cases page', async function () {
      req.session.cases = oralActiveAndDormantCases;
      activeCases.getActiveCases(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('active-tab.njk');
    });

    it('should throw error if no sessions', async function () {
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
