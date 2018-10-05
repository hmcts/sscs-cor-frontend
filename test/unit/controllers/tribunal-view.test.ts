import { OnlineHearing } from 'app/server/services/getOnlineHearing'
const { expect, sinon } = require('test/chai-sinon');
const { getTribunalView, postTribunalView, setupTribunalViewController } = require('app/server/controllers/tribunal-view');
const express = require('express');
const i18n = require('locale/en.json');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';

describe('controllers/tribunal-view', () => {
  let req: any;
  let res: any;
  let hearingDetails: OnlineHearing;
  let respondBy;

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
        decision_state_datetime: moment().utc().format()
    }
    };
    req = {
      session: {
        hearing: hearingDetails
      },
      body: {
        'accept-view': 'yes'
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
    respondBy = moment.utc(req.session.hearing.decision.decision_state_datetime).add(7, 'day').format();
  });

  describe('getTribunalView', () => {
    it('renders tribunal view page with issued decision', async() => {
      await getTribunalView(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view.html', { decision: hearingDetails.decision, respondBy });
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

  describe('postTribunalView', () => {
    describe('validation failed', () => {
      beforeEach(() => {
        req.body['accept-view'] = '';
        postTribunalView()(req, res);
      });

      it('renders the view with the error message', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view.html', {
          decision: hearingDetails.decision,
          respondBy,
          error: i18n.tribunalView.error.empty
        });
      });
    });
    describe('validation passed', () => {
      it('sets flag in session if accepts is yes', () => {
        postTribunalView()(req, res);
        expect(req.session).to.have.property('tribunalViewAcceptedThisSession', true);
      });
      it('redirects to view accepted page if accepts is yes', () => {
        postTribunalView()(req, res);
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalViewAccepted);
      });
      it('redirects to hearing confirm page if accepts is no', () => {
        req.body['accept-view'] = 'no';
        postTribunalView()(req, res);
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.hearingConfirm);
      });
    });
  });

  describe('setupTribunalViewController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.spy(),
        post: sinon.spy()
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

    it('calls router.post with the path and middleware', () => {
      setupTribunalViewController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(Paths.tribunalView);
    });

    it('returns the router', () => {
      const controller = setupTribunalViewController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
