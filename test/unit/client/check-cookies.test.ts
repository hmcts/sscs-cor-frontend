import { expect } from 'test/chai-sinon';
import { CheckCookies } from 'app/client/javascript/check-cookies';

describe('Client/check-cookies', () => {
  let checkCookies;
  before(() => {
    checkCookies = new CheckCookies();
    document.body.innerHTML = `<div id="${checkCookies.COOKIE_BANNER}"></div>`;
  });

  describe('#cookieBanner', () => {
    it('Cookie disabled', () => {
      const mockWindow = { navigator : { cookieEnabled : false }, document : {} };
      // Lock cookie property to simulate browser disabled cookies.
      Object.defineProperty(mockWindow.document, 'cookie', {
        value: '',
        writable: false
      });
      let result = checkCookies.testCookies(mockWindow);
      expect(result).to.equal(false);
    });

    it('Cookie enabled', () => {
      const mockWindow = { navigator : { cookieEnabled : true }, document : {} };
      let result = checkCookies.testCookies(mockWindow);
      expect(result).to.equal(true);
    });

    it('Cookie banner toggle', () => {
      const target: HTMLElement = document.getElementById(checkCookies.COOKIE_BANNER);
      checkCookies.toggleBanner(true);
      expect(target.style.display).to.equal('none');

      checkCookies.toggleBanner(false);
      expect(target.style.display).to.equal('block');
    });
  });
});
