import cookieManager from '@hmcts/cookie-manager';

interface DtrumApi {
  enable(): void;
  enableSessionReplay(): void;
  disable(): void;
  disableSessionReplay(): void;
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    dtrum: DtrumApi;
  }
}

interface Preferences {
  analytics: string;
  apm: string;
}

cookieManager.on('UserPreferencesLoaded', (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  dataLayer.push({
    event: 'Cookie Preferences',
    cookiePreferences: preferences,
  });
});

cookieManager.on('UserPreferencesSaved', (preferences: Preferences) => {
  const dataLayer = window.dataLayer || [];
  const dtrum = window.dtrum;

  dataLayer.push({
    event: 'Cookie Preferences',
    cookiePreferences: preferences,
  });

  // eslint-disable-next-line no-undefined
  if (dtrum !== undefined) {
    if (preferences.apm === 'on') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
});

const config = {
  userPreferences: {
    cookieName: 'sscs-manage-your-appeal-cookie-preferences',
  },
  cookieManifest: [
    {
      categoryName: 'analytics',
      cookies: ['_ga', '_gid', '_gat_UA-'],
    },
    {
      categoryName: 'apm',
      cookies: ['dtCookie', 'dtLatC', 'dtPC', 'dtSa', 'rxVisitor', 'rxvt'],
    },
  ],
};

cookieManager.init(config);
