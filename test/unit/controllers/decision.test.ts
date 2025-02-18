import { CaseDetails } from 'app/server/models/express-session';
import * as Paths from 'app/server/paths';
import moment from 'moment';
import { Dependencies } from 'app/server/routes';
import express, { Request, Response, Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';
import {
  getDecision,
  setupDecisionController,
} from 'app/server/controllers/decision';

describe('controllers/decision.js', function () {
  let req: Request = null;
  let res: Response = null;
  let caseDetails: CaseDetails = null;

  beforeEach(function () {
    caseDetails = {
      online_hearing_id: '1',
      case_reference: '12345',
      appellant_name: 'John Smith',
      decision: {
        start_date: '2019-01-01',
        end_date: '2020-10-10',
        decision_state: 'decision_accepted',
        decision_state_datetime: moment.utc().format(),
      },
      final_decision: {
        reason: 'final decision reason',
      },
      has_final_decision: true,
    };
    req = {
      session: {
        case: caseDetails,
      },
    } as Request;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    } as Partial<Response> as Response;
  });

  describe('getDecision', function () {
    it('renders decision page when have final decision', async function () {
      getDecision(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('decision.njk', {
        decision: caseDetails.decision,
        final_decision: caseDetails.final_decision.reason,
      });
    });

    it('redirects to /sign-out if final decision is not issued', async function () {
      req.session.case.has_final_decision = false;
      getDecision(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('setupDecisionController', function () {
    const deps: Dependencies = {};

    before(function () {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      } as Partial<Router> as Router);
    });

    beforeEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('calls router.get with the path and middleware', function () {
      setupDecisionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.decision);
    });

    it('returns the router', function () {
      const controller = setupDecisionController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
