const { expect, sinon } = require('test/chai-sinon');
const { getLogin, postLogin, setupLoginController } = require('app/controllers/login');
const appInsights = require('app-insights');
const express = require('express');
const paths = require('paths');

describe('controllers/login.js', () => {
  let next;
  let req;
  let res;
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };

  beforeEach(() => {
    req = {
      session: {
        question: {}
      },
      body: {
        'email-address': 'test@example.com'
      }
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub()
    };
    next = sinon.stub();
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  describe('#getLogin', () => {
    it('renders the template', () => {
      getLogin(req, res);
      expect(res.render).to.have.been.calledWith('login.html');
    });
  });

  describe('#postLogin', () => {
    let getOnlineHearingService;

    describe('on success', () => {
      beforeEach(async() => {
        getOnlineHearingService = sinon.stub().resolves(hearingDetails);
        await postLogin(getOnlineHearingService)(req, res, next);
      });

      it('calls the online hearing service', () => {
        expect(getOnlineHearingService).to.have.been.calledOnce.calledWith(req.body['email-address']);
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(paths.taskList);
      });
    });

    describe('on error', () => {
      const error = new Error('getOnlineHearingService error');

      beforeEach(async() => {
        getOnlineHearingService = sinon.stub().rejects(error);
        await postLogin(getOnlineHearingService)(req, res, next);
      });

      it('tracks the exception', () => {
        expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      });
      it('calls next with the error', () => {
        expect(next).to.have.been.calledWith(error);
      });
    });
  });

  describe('#setupLoginController', () => {
    const deps = {
      getOnlineHearingService: {}
    };

    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub()
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('sets up GET', () => {
      setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(paths.login);
    });

    it('sets up POST', () => {
      setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(paths.login);
    });

    it('returns the router', () => {
      const controller = setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
