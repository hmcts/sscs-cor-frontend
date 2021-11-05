import * as hearing from '../../../app/server/controllers/hearing';

const express = require('express');
const { expect, sinon } = require('test/chai-sinon');
import * as activeCases from 'app/server/controllers/active-cases';
import * as Paths from 'app/server/paths';
import * as appealStagesUtils from 'app/server/utils/appealStages';
import * as AppInsights from '../../../app/server/app-insights';
const oralHearing = require('../../mock/tribunals/data/oral/hearing.json');

describe('controllers/active-cases', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;
  const hearingDetails = {
    case_id: 12345,
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith'
  };

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
    it('should render active cases page', async() => {
      req.session['hearings'] = oralHearing;
      activeCases.getActiveCases(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('active-tab.html');
    });

    it('should throw error if no sessions', async() => {
      req.session = null;

      expect(() => activeCases.getActiveCases(req, res)).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(sinon.match.has('message', error.message));
      expect(AppInsights.trackEvent).to.have.been.calledOnce;
    });
  });
});
