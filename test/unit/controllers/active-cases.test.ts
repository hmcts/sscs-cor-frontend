import * as activeCases from 'app/server/controllers/active-cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';
import { SinonStubStatic } from 'sinon';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralActiveAndDormantCases = require('../../mock/tribunals/data/oral/activeAndDormantCases.json');

describe('controllers/active-cases', function () {
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

  describe('setupActiveCasesController', function () {
    let getStub;
    beforeEach(function () {
      getStub = sinon.stub(express.Router, 'get');
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
