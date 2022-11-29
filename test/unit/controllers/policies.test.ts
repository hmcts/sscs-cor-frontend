import * as Paths from 'app/server/paths';
import * as FeatureEnabled from '../../../app/server/utils/featureEnabled';
import { SinonStub } from 'sinon';
import { Router } from 'express';

const itParam = require('mocha-param');
const { expect, sinon } = require('test/chai-sinon');
const {
  setupCookiePrivacyController,
  getCookiePrivacy,
} = require('app/server/controllers/policies.ts');
const express = require('express');

describe('controllers/policies.js', function () {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    req = {
      session: {},
      cookies: {},
    } as any;
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    } as any;
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getCookiePrivacy', function () {
    let isFeatureEnabledStub: SinonStub = null;
    const scenarios = null;

    beforeEach(function () {
      isFeatureEnabledStub = sandbox.stub(FeatureEnabled, 'isFeatureEnabled');
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    itParam(
      `renders Cookie Policy page for cookieBanner.enabled`,
      [
        {
          cookieBannerFeature: true,
          expected: 'policy-pages/cookie-privacy-new.njk',
        },
        {
          cookieBannerFeature: false,
          expected: 'policy-pages/cookie-privacy-old.njk',
        },
      ],
      function (value) {
        isFeatureEnabledStub
          .withArgs(
            FeatureEnabled.Feature.ALLOW_COOKIE_BANNER_ENABLED,
            sinon.match.object
          )
          .returns(value.cookieBannerFeature);
        getCookiePrivacy(req, res);
        expect(res.render).to.have.been.calledOnce.calledWith(value.expected);
      }
    );
  });

  describe('setupCookiePrivacyController', function () {
    beforeEach(function () {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', function () {
      setupCookiePrivacyController();
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.cookiePrivacy);
      expect(express.Router().get).to.have.been.calledWith(
        Paths.cookiePrivacy2
      );
    });
  });
});
