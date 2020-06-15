import { OnlineHearing } from 'app/server/services/hearing';
const { expect, sinon } = require('test/chai-sinon');
import { getTribunalViewConfirm, postTribunalViewConfirm, setupTribunalViewConfirmController } from 'app/server/controllers/tribunal-view-confirm';
const express = require('express');
const i18n = require('locale/content');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';
import { CONST } from 'app/constants';
import * as AppInsights from 'app/server/app-insights';

describe('controllers/tribunal-view-confirm', () => {
  let req: any;
  let res: any;
  let next: sinon.SinonSpy;
  let hearingDetails: OnlineHearing;
  let respondBy;

  beforeEach(() => {
    hearingDetails = {
      online_hearing_id: '1',
      case_reference: '12345',
      appellant_name: 'John Smith',
      decision: {
        start_date: '2018-10-17',
        end_date: '2019-09-01',
        decision_state: 'decision_issued',
        decision_state_datetime: moment.utc().format()
      },
      has_final_decision: false
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
    next = sinon.spy();
    respondBy = moment.utc(req.session.hearing.decision.decision_state_datetime).add(7, 'day').format();
  });

  describe('getTribunalViewConfirm', () => {
    it('renders tribunal view confirm page with issued decision', async () => {
      getTribunalViewConfirm(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view-confirm.html');
    });

    it('redirects to /sign-out if decision is not issued', async () => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      getTribunalViewConfirm(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });

    it('redirects to /sign-out if decision is not present', async () => {
      delete req.session.hearing.decision;
      getTribunalViewConfirm(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('postTribunalView', () => {
    let hearingService;
    beforeEach(() => {
      hearingService = {
        recordTribunalViewResponse: sinon.stub().resolves()
      };
    });
    describe('validation failed', () => {
      beforeEach(async () => {
        req.body['accept-view'] = '';
        await postTribunalViewConfirm(hearingService)(req, res, next);
      });

      it('renders the view with the error message', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view-confirm.html', {
          error: i18n.en.tribunalView.error.emptyOnConfirm
        });
      });
    });

    describe('validation passed', () => {
      describe('accepts === yes', () => {
        beforeEach(() => {
          sinon.stub(AppInsights, 'trackException');
        });
        afterEach(() => {
          (AppInsights.trackException as sinon.SinonStub).restore();
        });
        it('calls service to record tribunal view acceptance', async () => {
          await postTribunalViewConfirm(hearingService)(req, res, next);
          expect(hearingService.recordTribunalViewResponse).to.have.been.calledOnce.calledWith(hearingDetails.online_hearing_id, CONST.DECISION_ACCEPTED_STATE);
        });
        it('calls next and app insights if service call fails', async () => {
          const error = new Error('recordTribunalViewResponse error');
          hearingService.recordTribunalViewResponse.rejects(error);
          await postTribunalViewConfirm(hearingService)(req, res, next);
          expect(next).to.have.been.calledOnce.calledWith(error);
          expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
        });
        it('set appellant reply properties against the decision in the session', async () => {
          await postTribunalViewConfirm(hearingService)(req, res, next);
          expect(req.session.hearing.decision).to.have.property('appellant_reply', 'decision_accepted');
          expect(req.session.hearing.decision).to.have.property('appellant_reply_datetime');
        });
        it('redirects to view accepted page', async () => {
          await postTribunalViewConfirm(hearingService)(req, res, next);
          expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalViewAccepted);
        });
      });
      describe('accepts === no', () => {
        it('redirects to hearing confirm page', async () => {
          req.body['accept-view'] = 'no';
          await postTribunalViewConfirm(hearingService)(req, res, next);
          expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalView);
        });
      });
    });
  });

  describe('setupTribunalViewConfirmController', () => {
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
      setupTribunalViewConfirmController(deps);
      expect(express.Router().get).to.have.been.calledWith(Paths.tribunalViewConfirm);
    });

    it('calls router.post with the path and middleware', () => {
      setupTribunalViewConfirmController(deps);
      expect(express.Router().post).to.have.been.calledWith(Paths.tribunalViewConfirm);
    });

    it('returns the router', () => {
      const controller = setupTribunalViewConfirmController(deps);
      expect(controller).to.equal(express.Router());
    });
  });
});
