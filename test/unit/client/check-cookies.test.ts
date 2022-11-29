import { expect, sinon } from 'test/chai-sinon';
import { CheckCookies } from 'app/client/javascript/check-cookies';
import { SinonSpy } from 'sinon';

describe('Client/check-cookies', function () {
  let checkCookies: CheckCookies;
  let toggleBannerSpy: SinonSpy;

  function deleteAllCookies() {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  before(function () {
    checkCookies = new CheckCookies();
    document.body.innerHTML = `<div id="${checkCookies.COOKIE_BANNER}"></div>`;
    toggleBannerSpy = sinon.spy(checkCookies, 'toggleBanner');
  });

  describe('Class', function () {
    before(function () {
      deleteAllCookies();
    });

    beforeEach(function () {
      toggleBannerSpy.resetHistory();
    });

    it('should initialize', function () {
      checkCookies.init();
      expect(checkCookies.cookieBannerElement.style.display).to.equal('block');
    });
  });

  describe('Browser Cookie Tests', function () {
    before(function () {
      deleteAllCookies();
    });

    beforeEach(function () {
      toggleBannerSpy.resetHistory();
    });

    it('isCookiePrivacyMessageDisplayed First Visit', function () {
      console.log('First Call', document.cookie);
      checkCookies.isCookiePrivacyMessageDisplayed();
      expect(toggleBannerSpy).to.have.been.calledWith(true);
    });

    it('isCookiePrivacyMessageDisplayed Second Visit', function () {
      console.log('Second Call', document.cookie);
      checkCookies.isCookiePrivacyMessageDisplayed();
      expect(toggleBannerSpy).to.have.been.calledWith(false);
    });
  });

  describe('Banner toggle', function () {
    beforeEach(function () {
      toggleBannerSpy.resetHistory();
    });

    it('Cookie banner toggle', function () {
      checkCookies.toggleBanner(true);
      expect(checkCookies.cookieBannerElement.style.display).to.equal('block');

      checkCookies.toggleBanner(false);
      expect(checkCookies.cookieBannerElement.style.display).to.equal('none');
    });
  });
});
