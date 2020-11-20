import { OnlineHearing } from 'app/server/services/hearing';
const { expect, sinon } = require('test/chai-sinon');
import { getIndex, postIndex, setupHearingWhyController } from 'app/server/controllers/hearing-why';
import * as express from 'express';
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
  const now = moment.utc().format();
  const accessToken = 'accessToken';
  const serviceToken = 'serviceToken';

  beforeEach(() => {
    hearingDetails = {
      online_hearing_id: '1',
      case_reference: '12345',
      appellant_name: 'John Smith',
      decision: {
        start_date: '2018-10-17',
        end_date: '2019-09-01',
        decision_state: 'decision_issued',
        decision_state_datetime: now
      },
      has_final_decision: false
    };
    req = {
      session: {
        hearing: hearingDetails,
        accessToken: accessToken,
        serviceToken: serviceToken
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
      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {
        submitted: false,
        responseDate: undefined
      });
    });

    it('renders hearing confirmation page if user previously requested a hearing', () => {
      const replyDatetime = '2018-10-10T14:43:06Z';
      req.session.hearing.decision.appellant_reply = 'decision_rejected';
      req.session.hearing.decision.appellant_reply_datetime = replyDatetime;
      const responseDate = moment.utc(replyDatetime).add(6, 'weeks').format();
      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html', {
        submitted: true,
        responseDate
      });
    });

    it('redirects to /sign-out if user does not have a decision view', async () => {
      req.session.hearing.decision.decision_state = 'decision_drafted';
      getIndex(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.logout);
    });
  });

  describe('postIndex', () => {
    let hearingService;

    beforeEach(() => {
      hearingService = {
        recordTribunalViewResponse: sinon.stub().resolves()
      };
      sinon.stub(AppInsights, 'trackException');

      serviceCall = [
        hearingDetails.online_hearing_id,
        CONST.DECISION_REJECTED_STATE,
        req,
        req.body['explain-why']
      ];

    });

    afterEach(() => {
      (AppInsights.trackException as sinon.SinonStub).restore();
    });

    describe('validation passed', () => {

      const inSixWeeks = moment.utc().add(6, 'weeks').format(CONST.DATE_FORMAT);

      it('set appellant reply properties against the decision in the session', async () => {
        await postIndex(hearingService)(req, res, next);
        expect(req.session.hearing.decision).to.have.property('appellant_reply', 'decision_rejected');
        expect(req.session.hearing.decision).to.have.property('appellant_reply_datetime');
      });

      it('renders the view with hearing booking details', async () => {
        await postIndex(hearingService)(req, res, next);
        expect(hearingService.recordTribunalViewResponse.args[0]).to.eql(serviceCall);
        expect(res.render).to.have.been.calledOnce.calledWith('hearing-why/index.html');
        expect(res.render.args[0][1].submitted).to.equal(true);
        expect(res.render.args[0][1].hearing).to.equal(hearingDetails);
        expect(moment.utc(res.render.args[0][1].responseDate).format(CONST.DATE_FORMAT)).to.equal(inSixWeeks);
      });

      it('calls next and app insights if service call fails', async () => {
        const error = new Error('recordTribunalViewResponse error');
        hearingService.recordTribunalViewResponse.rejects(error);
        await postIndex(hearingService)(req, res, next);
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
      expect(express.Router().get).to.have.been.calledWith(Paths.hearingWhy);
    });

    it('calls router.post with the path and middleware', () => {
      setupHearingWhyController(deps);
      expect(express.Router().post).to.have.been.calledWith(Paths.hearingWhy);
    });

    it('returns the router', () => {
      const controller = setupHearingWhyController(deps);
      expect(controller).to.equal(express.Router());
    });
  });
});
