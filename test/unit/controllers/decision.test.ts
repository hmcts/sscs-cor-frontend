import { OnlineHearing } from 'app/server/services/hearing';

import * as Paths from 'app/server/paths';
import * as moment from 'moment';
const { expect, sinon } = require('test/chai-sinon');
const {
  setupDecisionController,
  getDecision,
} = require('app/server/controllers/decision.ts');
const express = require('express');

describe('controllers/decision.js', () => {
  let req: any;
  let res: any;
  let hearingDetails: OnlineHearing;

  beforeEach(() => {
    hearingDetails = {
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
        hearing: hearingDetails,
      },
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    } as any;
  });

  describe('getDecision', () => {
    it('renders decision page when have final decision', async () => {
      await getDecision(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('decision.njk', {
        decision: hearingDetails.decision,
        final_decision: hearingDetails.final_decision.reason,
      });
    });

    it('redirects to /sign-out if final decision is not issued', async () => {
      req.session.hearing.has_final_decision = false;
      await getDecision(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('setupDecisionController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupDecisionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.decision);
    });

    it('returns the router', () => {
      const controller = setupDecisionController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
