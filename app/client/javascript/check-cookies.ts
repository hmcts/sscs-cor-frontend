export class CheckCookies {
  public COOKIE_BANNER: string = 'app-cookie-banner';
  public cookieBannerElement: HTMLElement;
  init(): void {
    this.cookieBannerElement = document.getElementById(this.COOKIE_BANNER);
    this.isCookiePrivacyMessageDisplayed();
  }

  isCookiePrivacyMessageDisplayed(): void {
    let isSessionSeenCookieExist = document.cookie.indexOf('seen_cookie_message=1') > -1;
    // If Cookie Message is not shown in the past.
    // Add a seen_cookie_message  cookie to user's browser for one year.
    if (isSessionSeenCookieExist) {
      this.toggleBanner(false);
    } else {
      let currentDate = new Date();
      let expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
      this.toggleBanner(true);
    }
  }

  toggleBanner(showCookieBanner: boolean): void {
    if (this.cookieBannerElement) {
      if (showCookieBanner) {
        this.cookieBannerElement.style.display = 'block';
      } else {
        this.cookieBannerElement.style.display = 'none';
      }
    }
  }
}
