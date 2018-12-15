export class CheckCookies {
  public COOKIE_BANNER: string = 'app-cookie-banner';

  testCookies(window): boolean {
    try {
      // Create cookie
      window.document.cookie = 'cookietest=1';
      let ret = window.document.cookie.indexOf('cookietest=') !== -1;
      // Delete cookie
      window.document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
      return ret;
    } catch (e) {
      return false;
    }
  }

  toggleBanner(cookieEnabled: boolean): void {
    const cookieBanner = document.getElementById(this.COOKIE_BANNER);
    if (!cookieEnabled) {
      cookieBanner.style.display = 'block';
    } else {
      cookieBanner.style.display = 'none';
    }
  }
}
