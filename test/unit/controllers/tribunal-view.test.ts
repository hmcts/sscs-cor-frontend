import { OnlineHearing } from 'app/server/services/getOnlineHearing'
const { expect, sinon } = require('test/chai-sinon');
const { getTribunalView, setupTribunalViewController } = require('app/server/controllers/tribunal-view');
const express = require('express');
import * as Paths from 'app/server/paths';

describe('controllers/tribunal-view', () => {
  let req: any;
  let res: any;
  let hearingDetails: OnlineHearing;

  beforeEach(() => {
    hearingDetails = {
      online_hearing_id: '1',
      case_reference: 'SC/123/456',
      appellant_name: 'John Smith',
      decision: {
        decision_award: 'appeal-upheld',
        decision_header: 'appeal-upheld',
        decision_reason: 'Decision reasons',
        decision_text: 'Decision reasons',
        decision_state: 'decision_issued',
    }
    };
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

  describe('getTribunalView', () => {
    it('renders tribunal view page with issued decision', async() => {
      await getTribunalView(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view.html', { decision: hearingDetails.decision });
    });

    it('redirects to /logout if decision is not issued', async() => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      await getTribunalView(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });

    it('redirects to /logout if decision is not present', async() => {
      delete req.session.hearing.decision;
      await getTribunalView(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('setupTribunalViewController', () => {
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
      setupTribunalViewController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.tribunalView);
    });

    it('returns the router', () => {
      const controller = setupTribunalViewController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
