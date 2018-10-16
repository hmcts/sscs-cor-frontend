import { OnlineHearing } from 'app/server/services/getOnlineHearing';
const { expect, sinon } = require('test/chai-sinon');
import { getIndex, postIndex, setupHearingWhyController } from 'app/server/controllers/hearing-why';
import * as express from 'express';
const i18n = require('locale/en.json');
import * as Paths from 'app/server/paths';
import * as moment from 'moment';
import { CONST } from 'app/constants';
import * as AppInsights from 'app/server/app-insights';

describe('controllers/hearing-why', () => {
  let req: any;
  let res: any;
  let next: sinon.SinonSpy;
  let hearingDetails: OnlineHearing;
  let serviceCall: any;

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
        decision_state_datetime: moment.utc().format()
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
    next = sinon.spy();
  });

  describe('getIndex', () => {
    it('renders hearing confirmation page', () => {
      req.session.newHearingConfirmationThisSession = true;
      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {});
    });

    it('redirects to /sign-out if user hasnt requested a hearing', async () => {
      getIndex(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('postIndex', () => {
    let tribunalViewService;

    beforeEach(() => {
      tribunalViewService = {
        recordTribunalViewResponse: sinon.stub().resolves()
      };
      sinon.stub(AppInsights, 'trackException');

      serviceCall = [
        hearingDetails.online_hearing_id,
        CONST.DECISION_REJECTED_STATE,
        req.body['explain-why']
      ];

    });

    afterEach(() => {
      (AppInsights.trackException as sinon.SinonStub).restore();
    });

    describe('validation failed', () => {

      beforeEach(async () => {
        req.body['explain-why'] = '';
        await postIndex(tribunalViewService)(req, res, next);
      });

      it('renders the view with the error message', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {
          error: i18n.hearingWhy.error.empty
        });
      });
    });

    describe('validation passed', () => {

      const inSixWeeks = moment.utc().add(6, 'weeks').format(CONST.DATE_FORMAT);

      it('renders the view with hearing booking details', async () => {
        await postIndex(tribunalViewService)(req, res, next);
        expect(tribunalViewService.recordTribunalViewResponse.args[0]).to.eql(serviceCall);
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html');
        expect(res.render.args[0][1].submitted).to.equal(true);
        expect(res.render.args[0][1].hearing).to.equal(hearingDetails);
        expect(moment.utc(res.render.args[0][1].responseDate).format(CONST.DATE_FORMAT)).to.equal(inSixWeeks);
      });

      it('calls next and app insights if service call fails', async () => {
        const error = new Error('recordTribunalViewResponse error');
        tribunalViewService.recordTribunalViewResponse.rejects(error);
        await postIndex(tribunalViewService)(req, res, next);
        expect(next).to.have.been.calledOnce.calledWith(error);
        expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
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
