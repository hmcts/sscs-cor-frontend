import { NextFunction, Request, Response } from 'express';
const { expect, sinon } = require('test/chai-sinon');
import { checkDecision } from 'app/server/middleware/check-decision.ts';
import * as Paths from 'app/server/paths';
import * as hearing from '../../../app/server/controllers/hearing';
import * as AppInsights from '../../../app/server/app-insights';

describe('middleware/check-decision', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      session: {
        id: '123',
        hearing: {
          online_hearing_id: '1',
          case_reference: '12345',
          appellant_name: 'John Smith',
          decision: {
            decision_award: 'appeal-upheld',
            decision_header: 'appeal-upheld',
            decision_reason: 'The decision',
            decision_text: 'The decision',
            decision_state: 'decision_drafted'
          },
          has_final_decision: false
        }
      }
    } as any;
    res = {
      redirect: sinon.spy()
    } as any;
    next = sinon.spy();

    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  it('calls next when decision that is not issued exists in the session', () => {
    checkDecision(req, res, next);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('calls next when no decision exists in the session', () => {
    delete req.session.hearing.decision;
    checkDecision(req, res, next);
    expect(next).to.have.been.calledOnce.calledWith();
  });

  it('should log exception if no session and call next', () => {
    delete req.session;

    checkDecision(req, res, next);

    const error = new Error('Unable to retrieve session from session store');
    expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(sinon.match.has('message', error.message));
    expect(AppInsights.trackEvent).to.have.been.calledOnce;
    expect(next).to.have.been.calledOnce.calledWith();
  });

  describe('when a tribunal view is available', () => {
    beforeEach(() => {
      req.session.hearing.decision.decision_state = 'decision_issued';
    });
    it('redirects to tribunal view page', () => {
      checkDecision(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalView);
    });
    it('redirects to tribunal view accepted page if appellant has accepted the view', () => {
      req.session.hearing.decision.appellant_reply = 'decision_accepted';
      checkDecision(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.tribunalViewAccepted);
    });
    it('redirects to hearing page if appellant has rejected the view', () => {
      req.session.hearing.decision.appellant_reply = 'decision_rejected';
      checkDecision(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.hearingWhy);
    });
    it('redirects to decision page if a final decision has been issued', () => {
      req.session.hearing.has_final_decision = true;
      checkDecision(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.decision);
    });
  });

  it('redirects to decision page if final decision has been issued and no prelimary view', () => {
    req.session.hearing.has_final_decision = true;
    req.session.hearing.decision = { 'reason': 'FINAL decision notes' };
    checkDecision(req, res, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.decision);
  });

  it('redirects to decision page if decision is accepted', () => {
    req.session.hearing.decision.decision_state = 'decision_accepted';
    checkDecision(req, res, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.decision);
  });

  it('redirects to decision page if decision is rejected', () => {
    req.session.hearing.decision.decision_state = 'decision_rejected';
    checkDecision(req, res, next);
    expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.decision);
  });
});

export {};
