import * as Paths from 'app/server/paths';
import * as FeatureEnabled from 'app/server/utils/featureEnabled';
import { SinonStub } from 'sinon';
import express, { Router } from 'express';
import { expect, sinon } from 'test/chai-sinon';
import {
  getCookiePrivacy,
  setupCookiePrivacyController,
} from 'app/server/controllers/policies';
import itParam from 'mocha-param';

describe('controllers/policies.js', function () {
  let req: any;
  let res: any;

  beforeEach(function () {
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
    sinon.restore();
  });

  describe('getCookiePrivacy', function () {
    let isFeatureEnabledStub: SinonStub = null;
    const scenarios = null;

    beforeEach(function () {
      isFeatureEnabledStub = sinon.stub(FeatureEnabled, 'isFeatureEnabled');
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
    let getStub: SinonStub = null;
    before(function () {
      getStub = sinon.stub();
      sinon.stub(express, 'Router').returns({
        get: getStub,
      } as Partial<Router> as Router);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('calls router.get with the path and middleware', function () {
      setupCookiePrivacyController();
      // eslint-disable-next-line new-cap
      expect(getStub).to.have.been.calledWith(Paths.cookiePrivacy);
      expect(getStub).to.have.been.calledWith(Paths.cookiePrivacy2);
    });
  });
});
