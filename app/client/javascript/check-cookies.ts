export class CheckCookies {
  public COOKIE_BANNER: string = 'app-cookie-banner';

  isCookiePrivacyMessageDisplayed(window): boolean {
    let ret = window.document.cookie.indexOf('seen_cookie_message=1') !== -1;

    // If Cookie Message is not shown in the past.
    // Add a seen_cookie_message  cookie to user's browser for one year.
    if (!ret) {
      let currentDate = new Date();
      let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      window.document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
    }

    return ret;
  }

  toggleBanner(showCookieBanner: boolean): void {
    const cookieBanner = document.getElementById(this.COOKIE_BANNER);
    if (showCookieBanner) {
      cookieBanner.style.display = 'block';
    } else {
      cookieBanner.style.display = 'none';
    }
  }
}
