import { NextFunction, Request, Response } from 'express'
const { expect, sinon } = require('test/chai-sinon');
import { checkDecision } from 'app/server/middleware/check-decision.ts';
import * as Paths from 'app/server/paths';

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
          case_reference: 'SC/123/456',
          appellant_name: 'John Smith',
          decision: {
            decision_award: 'appeal-upheld',
            decision_header: 'appeal-upheld',
            decision_reason: 'The decision',
            decision_text: 'The decision',
            decision_state: 'decision_drafted'
          }
        }
      }
    } as any;
    res = {
      redirect: sinon.spy()
    } as any;
    next = sinon.spy();
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