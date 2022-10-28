import { expect, sinon } from 'test/chai-sinon';
import { CheckCookies } from 'app/client/javascript/check-cookies';

describe('Client/check-cookies', () => {
  let checkCookies: CheckCookies;
  let toggleBannerSpy: any;

  function deleteAllCookies() {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  before(() => {
    checkCookies = new CheckCookies();
    document.body.innerHTML = `<div id="${checkCookies.COOKIE_BANNER}"></div>`;
    toggleBannerSpy = sinon.spy(checkCookies, 'toggleBanner');
  });

  describe('Class', () => {
    before(() => {
      deleteAllCookies();
    });

    beforeEach(() => {
      toggleBannerSpy.reset();
    });

    it('should initialize', () => {
      checkCookies.init();
      expect(checkCookies.cookieBannerElement.style.display).to.equal('block');
    });
  });

  describe('Browser Cookie Tests', () => {
    before(() => {
      deleteAllCookies();
    });

    beforeEach(() => {
      toggleBannerSpy.reset();
    });

    it('isCookiePrivacyMessageDisplayed First Visit', () => {
      console.log('First Call', document.cookie);
      checkCookies.isCookiePrivacyMessageDisplayed();
      expect(toggleBannerSpy).to.have.been.calledWith(true);
    });

    it('isCookiePrivacyMessageDisplayed Second Visit', () => {
      console.log('Second Call', document.cookie);
      checkCookies.isCookiePrivacyMessageDisplayed();
      expect(toggleBannerSpy).to.have.been.calledWith(false);
    });
  });

  describe('Banner toggle', () => {
    beforeEach(() => {
      toggleBannerSpy.reset();
    });

    it('Cookie banner toggle', () => {
      checkCookies.toggleBanner(true);
      expect(checkCookies.cookieBannerElement.style.display).to.equal('block');

      checkCookies.toggleBanner(false);
      expect(checkCookies.cookieBannerElement.style.display).to.equal('none');
    });
  });
});
