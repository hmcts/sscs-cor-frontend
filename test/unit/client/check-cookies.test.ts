import { expect } from 'test/chai-sinon';
import { CheckCookies } from 'app/client/javascript/check-cookies';

describe('Client/check-cookies', () => {
  let checkCookies;
  before(() => {
    checkCookies = new CheckCookies();
    document.body.innerHTML = `<div id="${checkCookies.COOKIE_BANNER}"></div>`;
  });

  describe('Class', () => {
    it('should initialize', () => {
      const mockWindow = { navigator : { cookieEnabled : true }, document : { cookie: '' } };
      checkCookies.initCookies(mockWindow);
      const target: HTMLElement = document.getElementById(checkCookies.COOKIE_BANNER);
      expect(target.style.display).to.equal('block');
    });
  });

  describe('Browser Cookie Tests', () => {
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
      expect(target.style.display).to.equal('block');

      checkCookies.toggleBanner(false);
      expect(target.style.display).to.equal('none');
    });
  });
});
