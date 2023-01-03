import * as cases from 'app/server/controllers/cases';
import * as Paths from 'app/server/paths';
import * as AppInsights from 'app/server/app-insights';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
const oralCases = require('../../mock/tribunals/data/oral/activeAndDormantCases.json');

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
    let getStub;
    beforeEach(function () {
      getStub = sinon.stub(express.Router, 'get');
    });

    afterEach(function () {
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
