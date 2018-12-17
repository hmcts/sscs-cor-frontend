export class CheckCookies {
  public COOKIE_BANNER: string = 'app-cookie-banner';

  isCookieEnabled(window): boolean {
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

  isCookiePrivacyMessageDisplayed(window): boolean {
    let ret = window.document.cookie.indexOf('seen_cookie_message=1') !== -1;

    // If Cookie Message is not shown in the past.
    // Add a seen_cookie_message  cookie to user's browser for one year.
    if (!ret) {
      window.document.cookie = `seen_cookie_message=1; expires=${new Date(new Date().setFullYear(new Date().getFullYear() + 1))}`;
    }

    return ret;
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
