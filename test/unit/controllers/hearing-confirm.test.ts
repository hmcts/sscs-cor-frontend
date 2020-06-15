import { OnlineHearing } from 'app/server/services/hearing';
const { expect, sinon } = require('test/chai-sinon');
import { getIndex, postIndex, setupHearingConfirmController } from 'app/server/controllers/hearing-confirm';
import * as express from 'express';
const i18n = require('locale/content');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';

describe('controllers/hearing-confirm', () => {
  let req: any;
  let res: any;
  let hearingDetails: OnlineHearing;
  let respondBy;

  beforeEach(() => {
    hearingDetails = {
      online_hearing_id: '1',
      case_reference: '12345',
      appellant_name: 'John Smith',
      decision: {
        start_date: '2019-01-01',
        end_date: '2020-10-10',
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
        'new-hearing': 'yes'
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getIndex', () => {
    it('renders hearing confirmation page', () => {
      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-confirm/index.html');
    });

    it('redirects to /hearing-why if user has already requested a hearing', async() => {
      req.session.hearing.decision.appellant_reply = 'decision_rejected';
      req.session.hearing.decision.appellant_reply_datetime = moment.utc().format();
      getIndex(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.hearingWhy);
    });

    it('redirects to /sign-out if user does not have a decision view', async() => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      getIndex(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('postIndex', () => {
    describe('validation failed', () => {
      beforeEach(() => {
        delete req.body['new-hearing'];
        postIndex(req, res);
      });

      it('renders the view with the error message', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-confirm/index.html', {
          error: i18n.en.hearingConfirm.error.text
        });
      });
    });
    describe('validation passed', () => {

      it('redirects to hearing reason why page if accepts is yes', () => {
        postIndex(req, res);
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.hearingWhy);
      });
      it('redirects to tribunal view if accepts is no', () => {
        req.body['new-hearing'] = 'no';
        postIndex(req, res);
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalView);
      });
    });
  });

  describe('setupHearingConfirmController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.spy(),
        post: sinon.spy()
      });
    });

    afterEach(() => {
      (express.Router as sinon.SinonStub).restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupHearingConfirmController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.hearingConfirm);
    });

    it('calls router.post with the path and middleware', () => {
      setupHearingConfirmController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(Paths.hearingConfirm);
    });

    it('returns the router', () => {
      const controller = setupHearingConfirmController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
