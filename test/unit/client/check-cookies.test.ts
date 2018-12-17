import { expect } from 'test/chai-sinon';
import { CheckCookies } from 'app/client/javascript/check-cookies';

describe('Client/check-cookies', () => {
  let checkCookies;
  before(() => {
    checkCookies = new CheckCookies();
    document.body.innerHTML = `<div id="${checkCookies.COOKIE_BANNER}"></div>`;
  });

  describe('Browser Cookie Tests', () => {
    it('Cookie disabled', () => {
      const mockWindow = { navigator : { cookieEnabled : false }, document : {} };
      // Lock cookie property to simulate browser disabled cookies.
      Object.defineProperty(mockWindow.document, 'cookie', {
        value: '',
        writable: false
      });
      let result = checkCookies.isCookieEnabled(mockWindow);
      expect(result).to.equal(false);
    });

    it('Cookie enabled', () => {
      const mockWindow = { navigator : { cookieEnabled : true }, document : {} };
      let result = checkCookies.isCookieEnabled(mockWindow);
      expect(result).to.equal(true);
    });

    it('test if Cookie Privacy Message Displayed', () => {
      const mockWindow = { navigator : { cookieEnabled : true }, document : { cookie: '' } };
      // First time visit
      let result = checkCookies.isCookiePrivacyMessageDisplayed(mockWindow);
      expect(result).to.equal(false);
      // Second time visit
      result = checkCookies.isCookiePrivacyMessageDisplayed(mockWindow);
      expect(result).to.equal(true);
    });

  });

  describe('#cookieBanner', () => {
    it('Cookie banner toggle', () => {
      const target: HTMLElement = document.getElementById(checkCookies.COOKIE_BANNER);
      checkCookies.toggleBanner(true);
      expect(target.style.display).to.equal('none');

      checkCookies.toggleBanner(false);
      expect(target.style.display).to.equal('block');
    });
  });
});
