import * as FeatureEnabled from '../../../app/server/utils/featureEnabled';

import * as Paths from 'app/server/paths';

const { expect, sinon } = require('test/chai-sinon');
const {
  setupCookiePrivacyController,
  getCookiePrivacy,
} = require('app/server/controllers/policies.ts');
const express = require('express');

describe('controllers/policies.js', () => {
  let req: any;
  let res: any;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
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

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCookiePrivacy', () => {
    let isFeatureEnabledStub;
    beforeEach(() => {
      isFeatureEnabledStub = sandbox.stub(FeatureEnabled, 'isFeatureEnabled');
    });

    const scenarios = [
      {
        cookieBannerFeature: true,
        expected: 'policy-pages/cookie-privacy-new.njk',
      },
      {
        cookieBannerFeature: false,
        expected: 'policy-pages/cookie-privacy-old.njk',
      },
    ];

    scenarios.forEach((scenario) => {
      it(`renders Cookie Policy page for cookieBanner.enabled = ${scenario.cookieBannerFeature}`, () => {
        isFeatureEnabledStub
          .withArgs(
            FeatureEnabled.Feature.ALLOW_COOKIE_BANNER_ENABLED,
            sinon.match.object
          )
          .returns(scenario.cookieBannerFeature);
        getCookiePrivacy(req, res);
        expect(res.render).to.have.been.calledOnce.calledWith(
          scenario.expected
        );
      });
    });
  });

  describe('setupCookiePrivacyController', () => {
    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
      });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupCookiePrivacyController();
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.cookiePrivacy);
      expect(express.Router().get).to.have.been.calledWith(
        Paths.cookiePrivacy2
      );
    });
  });
});
