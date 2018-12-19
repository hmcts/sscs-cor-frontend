import { OnlineHearing } from 'app/server/services/hearing';
const { expect, sinon } = require('test/chai-sinon');
const { getTribunalView, postTribunalView, setupTribunalViewController } = require('app/server/controllers/tribunal-view');
const express = require('express');
const i18n = require('locale/en.json');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';
import * as AppInsights from 'app/server/app-insights';

describe('controllers/tribunal-view', () => {
  let req: any;
  let res: any;
  let next: sinon.SinonSpy;
  let hearingDetails: OnlineHearing;
  let respondBy;
  let startDate;
  let endDate;

  beforeEach(() => {
    hearingDetails = {
      online_hearing_id: '1',
      case_reference: 'SC/123/456',
      appellant_name: 'John Smith',
      decision: {
        start_date: '2018-10-17',
        end_date: '2019-09-01',
        decision_state: 'decision_issued',
        decision_state_datetime: moment.utc().format()
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
    next = sinon.spy();
    respondBy = moment.utc(req.session.hearing.decision.decision_state_datetime).add(7, 'day').format();
    startDate = moment.utc(req.session.hearing.decision.start_date).format();
    endDate = moment.utc(req.session.hearing.decision.end_date).format();
  });

  describe('getTribunalView', () => {
    it('renders tribunal view page with issued decision', async () => {
      await getTribunalView(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view.html', { decision: hearingDetails.decision, respondBy, startDate, endDate });
    });

    it('redirects to /sign-out if decision is not issued', async () => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      await getTribunalView(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });

    it('redirects to /sign-out if decision is not present', async () => {
      delete req.session.hearing.decision;
      await getTribunalView(req, res);
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
        await postTribunalView(hearingService)(req, res, next);
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
      describe('accepts === yes', () => {
        beforeEach(() => {
          sinon.stub(AppInsights, 'trackException');
        });
        afterEach(() => {
          (AppInsights.trackException as sinon.SinonStub).restore();
        });
        it('redirects to tribunal view confirm page', async () => {
          await postTribunalView(hearingService)(req, res, next);
          expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalViewConfirm);
        });
      });
      describe('accepts === no', () => {
        it('redirects to hearing confirm page', async () => {
          req.body['accept-view'] = 'no';
          await postTribunalView(hearingService)(req, res, next);
          expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.hearingConfirm);
        });
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
      expect(express.Router().get).to.have.been.calledWith(Paths.tribunalView);
    });

    it('calls router.post with the path and middleware', () => {
      setupTribunalViewController(deps);
      expect(express.Router().post).to.have.been.calledWith(Paths.tribunalView);
    });

    it('returns the router', () => {
      const controller = setupTribunalViewController(deps);
      expect(controller).to.equal(express.Router());
    });
  });
});
