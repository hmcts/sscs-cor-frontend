export class CheckCookies {
  public COOKIE_BANNER = 'app-cookie-banner';
  public cookieBannerElement: HTMLElement;
  init(): void {
    this.cookieBannerElement = document.getElementById(this.COOKIE_BANNER);
    this.isCookiePrivacyMessageDisplayed();
  }

  isCookiePrivacyMessageDisplayed(): void {
    const isSessionSeenCookieExist = document.cookie.includes(
      'seen_cookie_message=1'
    );
    // If Cookie Message is not shown in the past.
    // Add a seen_cookie_message  cookie to user's browser for one year.
    if (isSessionSeenCookieExist) {
      this.toggleBanner(false);
    } else {
      const currentDate = new Date();
      const expiryDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 1)
      );
      document.cookie = `seen_cookie_message=1; expires=${expiryDate}; path=/`;
      this.toggleBanner(false);
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
