import cookieManager from '@hmcts/cookie-manager';

const cookieManagerConfig = {
  userPreferences: {
    cookieName: 'mya-cookie-preferences',
    cookieExpiry: 365,
    cookieSecure: true,
  },
  cookieBanner: {
    class: 'cookie-banner',
    showWithPreferencesForm: true,
    actions: [
      {
        name: 'accept',
        buttonClass: 'cookie-banner-accept-button',
        confirmationClass: 'cookie-banner-accept-message',
        consent: true,
      },
      {
        name: 'reject',
        buttonClass: 'cookie-banner-reject-button',
        confirmationClass: 'cookie-banner-reject-message',
        consent: false,
      },
      {
        name: 'hide',
        buttonClass: 'cookie-banner-hide-button',
      },
    ],
  },
  preferencesForm: {
    class: 'cookie-preferences-form',
  },
  cookieManifest: [
    {
      categoryName: 'analytics',
      cookies: ['_ga', '_gid', '_gat'],
    },
    {
      categoryName: 'apm',
      cookies: ['dtCookie', 'dtLatC', 'dtPC', 'dtSa', 'rxVisitor', 'rxvt'],
    },
    {
      categoryName: 'essential',
      optional: false,
      matchBy: 'exact',
      cookies: ['_csrf', '__user-info'],
    },
  ],
};

export function init(): void {
  cookieManager.on('UserPreferencesLoaded', (preferences) => {
    const dataLayer = window.dataLayer || [];

    dataLayer.push({
      event: 'Cookie Preferences',
      cookiePreferences: preferences,
    });
  });

  cookieManager.on('UserPreferencesSaved', (preferences) => {
    const dataLayer = window.dataLayer || [];
    const dtrum = window.dtrum;

    dataLayer.push({
      event: 'Cookie Preferences',
      cookiePreferences: preferences,
    });

    if (dtrum) {
      if (preferences.apm === 'on') {
        dtrum.enable();
        dtrum.enableSessionReplay();
      } else {
        dtrum.disableSessionReplay();
        dtrum.disable();
      }
    }
  });

  cookieManager.on('UserPreferencesSaved', (preferences) => {
    document
      .getElementById('cookie-preference-success')
      .classList.remove('govuk-visually-hidden');
  });
  cookieManager.init(cookieManagerConfig);
}
