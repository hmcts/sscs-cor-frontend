import { OnlineHearing } from 'app/server/services/getOnlineHearing'
const { expect, sinon } = require('test/chai-sinon');
import { getIndex, postIndex, setupHearingWhyController   } from 'app/server/controllers/hearing-why';
import * as express from 'express';
const i18n = require('locale/en.json');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';

describe('controllers/hearing-why', () => {
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
        'explain-why': 'My explanation of why I want a hearing'
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getIndex', () => {
    it('renders hearing confirmation page', () => {
      req.session.newHearingConfirmationThisSession = true;
      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {});
    });

    it('redirects to /logout if user hasnt requested a hearing', async() => {
      getIndex(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('postIndex', () => {
    describe('validation failed', () => {
      beforeEach(() => {
        req.body['explain-why'] = '';
        postIndex(req, res);
      });

      it('renders the view with the error message', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {
          error: i18n.hearingWhy.error.empty
        });
      });
    });

    describe('validation passed', () => {
      it('renders the view with hearing booking details', () => {
        postIndex(req, res);
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html');
        //  TODO
        // expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', { submitted: true, hearing: hearingDetails });
      });
    });
  });

  describe('setupHearingWhyController', () => {
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
      setupHearingWhyController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.hearingWhy);
    });

    it('calls router.post with the path and middleware', () => {
      setupHearingWhyController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(Paths.hearingWhy);
    });

    it('returns the router', () => {
      const controller = setupHearingWhyController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
