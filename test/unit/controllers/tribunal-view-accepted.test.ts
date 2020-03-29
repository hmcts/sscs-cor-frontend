const { expect, sinon } = require('test/chai-sinon');
const { setupTribunalViewAcceptedController, getTribunalViewAccepted } = require('app/server/controllers/tribunal-view-accepted');
import * as moment from 'moment';
import * as express from 'express';
import * as Paths from 'app/server/paths';

describe.skip('controllers/tribunal-view-accepted', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      session: {
        hearing: {}
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getTribunalViewAccepted', () => {
    it('renders tribunal view accepted page with next correspondence date', async () => {
      const replyDatetime = '2018-10-10T14:43:06Z';
      const nextCorrespondenceDate = moment.utc(replyDatetime).add(14, 'days').format();
      req.session.hearing = {
        decision: {
          appellant_reply: 'decision_accepted',
          appellant_reply_datetime: replyDatetime
        }
      };
      await getTribunalViewAccepted(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('tribunal-view-accepted.html', { nextCorrespondenceDate });
    });

    it('redirects to /task-list if view was not accepted', async() => {
      await getTribunalViewAccepted(req, res);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });
  });

  describe('setupTribunalViewAcceptedController', () => {
    let deps;
    beforeEach(() => {
      deps = {};
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub()
      });
    });

    afterEach(() => {
      (express.Router as sinon.SinonStub).restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupTribunalViewAcceptedController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.tribunalViewAccepted);
    });

    it('returns the router', () => {
      const controller = setupTribunalViewAcceptedController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
