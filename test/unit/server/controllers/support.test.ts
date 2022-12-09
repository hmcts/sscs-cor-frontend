import * as support from 'app/server/controllers/support';
import * as Paths from 'app/server/paths';
import { Dependencies } from 'app/server/routes';
import { SinonStub } from 'sinon';
import express, { Request, Response, Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';

describe('controllers/support', function () {
  const req = {} as Request;
  const res = {} as Response;

  let setLocals: SinonStub = null;
  let routerStub: SinonStub = null;

  before(function () {
    res.render = sinon.stub();
    setLocals = sinon.stub();
    routerStub = sinon.stub(express, 'Router').returns({
      get: sinon.stub(),
    } as Partial<Router> as Router);
  });

  after(function () {
    sinon.restore();
  });

  describe('supportEvidence', function () {
    const deps: Dependencies = { setLocals };

    afterEach(function () {
      sinon.resetHistory();
    });

    it('#setupSupportEvidenceController sets up GET supportEvidence', function () {
      support.setupSupportEvidenceController(deps);
      expect(express.Router().get).to.have.been.calledOnceWith(
        Paths.supportEvidence
      );
    });

    it('#supportEvidence renders help-guides/support-evidence.njk', function () {
      support.supportEvidence(req, res);
      expect(res.render).to.have.been.calledOnceWith(
        'help-guides/support-evidence.njk',
        { req }
      );
    });
  });

  describe('supportHearingExpenses', function () {
    const deps: Dependencies = { setLocals };

    afterEach(function () {
      sinon.resetHistory();
    });

    it('#supportHearingExpenses sets up GET supportHearingExpenses', function () {
      support.setupSupportHearingExpensesController(deps);
      expect(express.Router().get).to.have.been.calledOnceWith(
        Paths.supportHearingExpenses
      );
    });

    it('#setupSupportHearingExpensesController renders help-guides/support-hearing-expenses.njk', function () {
      support.supportHearingExpenses(req, res);
      expect(res.render).to.have.been.calledOnceWith(
        'help-guides/support-hearing-expenses.njk',
        { req }
      );
    });
  });

  describe('supportHearing', function () {
    const deps: Dependencies = { setLocals };

    afterEach(function () {
      sinon.resetHistory();
    });

    it('#setupSupportHearingController sets up GET supportHearing', function () {
      support.setupSupportHearingController(deps);
      expect(express.Router().get).to.have.been.calledOnceWith(
        Paths.supportHearing
      );
    });

    it('#supportHearing renders help-guides/support-hearing.njk', function () {
      support.supportHearing(req, res);
      expect(res.render).to.have.been.calledOnceWith(
        'help-guides/support-hearing.njk',
        { req }
      );
    });
  });

  describe('supportRepresentatives', function () {
    const deps: Dependencies = { setLocals };

    afterEach(function () {
      sinon.resetHistory();
    });

    it('#setupSupportRepresentativesController sets up GET supportRepresentatives', function () {
      support.setupSupportRepresentativesController(deps);
      expect(express.Router().get).to.have.been.calledOnceWith(
        Paths.supportRepresentatives
      );
    });

    it('#supportRepresentatives renders help-guides/support-representatives.njk', function () {
      support.supportRepresentatives(req, res);
      expect(res.render).to.have.been.calledOnceWith(
        'help-guides/support-representatives.njk',
        { req }
      );
    });
  });

  describe('supportWithdrawAppeal', function () {
    const deps: Dependencies = { setLocals };

    afterEach(function () {
      sinon.resetHistory();
    });

    it('#setupSupportWithdrawAppealController sets up GET supportWithdrawAppeal', function () {
      support.setupSupportWithdrawAppealController(deps);
      expect(express.Router().get).to.have.been.calledOnceWith(
        Paths.supportWithdrawAppeal
      );
    });

    it('#supportWithdrawAppeal renders help-guides/support-withdraw-appeal.njk', function () {
      support.supportWithdrawAppeal(req, res);
      expect(res.render).to.have.been.calledOnceWith(
        'help-guides/support-withdraw-appeal.njk',
        { req }
      );
    });
  });
});
