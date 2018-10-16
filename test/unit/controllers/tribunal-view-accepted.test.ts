const { expect, sinon } = require('test/chai-sinon');
const { setupTribunalViewAcceptedController, getTribunalViewAccepted } = require('app/server/controllers/tribunal-view-accepted');
import * as moment from 'moment';
import * as express from 'express';
import * as Paths from 'app/server/paths';

describe('controllers/tribunal-view-accepted', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      session: {
        tribunalViewAcceptedThisSession: true
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getTribunalViewAccepted', () => {
    it('renders tribunal view accepted page with next correspondence date', async() => {
      const nextCorrespondenceDate = moment.utc().add(14, 'days').format();
      await getTribunalViewAccepted(req, res);
      const theTemplate = res.render.getCall(0).args[0];
      const theCorrespondenceDate = res.render.getCall(0).args[1].nextCorrespondenceDate;
      expect(theTemplate).to.equal('tribunal-view-accepted.html');
      expect(moment(theCorrespondenceDate).format('LL')).to.equal(moment(nextCorrespondenceDate).format('LL'));

    });

    it('redirects to /task-list if view was not accepted in this session', async() => {
      delete req.session.tribunalViewAcceptedThisSession;
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
