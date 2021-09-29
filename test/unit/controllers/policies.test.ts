const { expect, sinon } = require('test/chai-sinon');
const { setupCookiePrivacyController, getCookiePrivacy, getNewCookiePrivacy } = require('app/server/controllers/policies.ts');
const express = require('express');
import * as Paths from 'app/server/paths';

describe.only('controllers/policies.js', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {},
      cookies: {}
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCookiePrivacy', () => {
    it('renders old Cookie Policy page', async() => {
      await getCookiePrivacy(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('policy-pages/cookie-privacy-old.html');
    });
  });

  describe('getNewCookiePrivacy', () => {
    it('renders new Cookie Policy page', async() => {
      await getNewCookiePrivacy(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('policy-pages/cookie-privacy-new.html');
    });
  });

  describe('setupCookiePrivacyController', () => {
    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub()
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupCookiePrivacyController();
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.cookiePrivacy);
      expect(express.Router().get).to.have.been.calledWith(Paths.cookiePrivacy2);
    });
  });
});
