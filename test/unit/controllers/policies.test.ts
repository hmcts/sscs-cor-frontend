
const { expect, sinon } = require('test/chai-sinon');
const { setupCookiePrivacyController, getCookiePrivacy } = require('app/server/controllers/policies.ts');
const express = require('express');
import * as Paths from 'app/server/paths';

describe('controllers/policies.js', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      session: {
        featureToggles: {
          ft_welsh: false
        }
      }
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy()
    } as any;
  });

  describe('getCookiePrivacy', () => {
    it('renders Cookie Policy page', async() => {
      await getCookiePrivacy(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith('policy-pages/cookie-privacy.html', {
        ft_welsh: false
      });
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
    });
  });
});
