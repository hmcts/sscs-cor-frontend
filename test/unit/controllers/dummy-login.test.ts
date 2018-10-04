import * as Paths from "../../../app/server/paths";
const { expect, sinon } = require('test/chai-sinon');
const { getLogin, postLogin, setupDummyLoginController } = require('app/server/controllers/dummy-login.ts');
const express = require('express');

describe('controllers/dummy-login.js', () => {
  const req = {
    body: {}
  };
  const res = {
    render: sinon.stub(),
    redirect: sinon.stub()
  };
  const next = sinon.stub();

  describe('#getLogin', () => {
    it('load dummy login page', () => {
      getLogin(req, res);

      expect(res.render).to.have.been.calledOnce.calledWith('dummy-login.html');
    });
  });

  describe('#postLogin', () => {
    it('load hearing and enters service', () => {
      const email = "someEmail";
      req.body['username'] = email;
      const loadHearingAndEnterService = sinon.stub();
      const getOnlineHearingService = {};
      postLogin(loadHearingAndEnterService, getOnlineHearingService)(req, res, next);

      expect(loadHearingAndEnterService).to.have.been.calledOnce.calledWith(getOnlineHearingService, email, req, res);
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

    it('sets up GET dummy login', () => {
      setupDummyLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.dummyLogin);
    });

    it('sets up POST dummy logout', () => {
      setupDummyLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(Paths.dummyLogin);
    });

    it('returns the router', () => {
      const controller = setupDummyLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});