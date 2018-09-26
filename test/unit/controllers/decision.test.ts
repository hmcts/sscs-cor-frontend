import { OnlineHearing } from 'app/server/services/getOnlineHearing'
const { expect, sinon } = require('test/chai-sinon');
const { setupDecisionController, getDecision } = require('app/server/controllers/decision');
const express = require('express');
import * as Paths from 'app/server/paths';

describe('controllers/decision.js', () => {
  let req: any;
  let res: any;
  const hearingDetails: OnlineHearing = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith',
    decision: {
      decision_award: 'FINAL',
      decision_header: 'Decision header',
      decision_reason: 'Decision reason',
      decision_text: 'Decision test',
      decision_state: 'decision_issued',
    }
  };

  beforeEach(() => {
    req = {
      session: {
        hearing: hearingDetails
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getDecision', () => {
    it('renders decision page with decision', async() => {
      await getDecision(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('decision.html', { decision: hearingDetails.decision });
    });

    it('redirects to /logout if decision is not issued', async() => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      await getDecision(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });

    it('redirects to /logout if decision is not present', async() => {
      delete req.session.hearing.decision;
      await getDecision(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('setupDecisionController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub()
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
