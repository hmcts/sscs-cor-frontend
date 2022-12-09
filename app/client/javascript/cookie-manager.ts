import cookieManager from '@hmcts/cookie-manager';

interface UserPreferences {
  cookieName: string;
  cookieExpiry: number;
  cookieSecure: boolean;
}
interface PreferencesForm {
  class: string;
}
interface CookieBanner {
  class: string;
  showWithPreferencesForm: boolean;
  actions: {
    name: string;
    buttonClass: string;
    confirmationClass?: string;
    consent?: string[] | boolean;
  }[];
}
interface CookieManifest {
  categoryName: string;
  optional?: boolean;
  matchBy?: string;
  cookies: string[];
}
interface AdditionalOptions {
  disableCookieBanner: boolean;
  disableCookiePreferencesForm: boolean;
  deleteUndefinedCookies: boolean;
  defaultConsent: boolean;
}

interface CookieManagerConfig {
  userPreferences: Partial<UserPreferences>;
  preferencesForm: Partial<PreferencesForm>;
  cookieBanner: Partial<CookieBanner>;
  cookieManifest: CookieManifest[];
  additionalOptions: Partial<AdditionalOptions>;
}

export const cookieManagerConfig: Partial<CookieManagerConfig> = {
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

function showCookiePreferenceSuccess(): void {
  document
    .getElementById('cookie-preference-success')
    .classList.remove('govuk-visually-hidden');
}

function pushCookiePreferences(preferences: Record<string, string>): void {
  const dataLayer = window.dataLayer || [];

  dataLayer.push({
    event: 'Cookie Preferences',
    cookiePreferences: preferences,
  });
}

function pushDtrumPreferences(preferences: Record<string, string>): void {
  const dtrum = window.dtrum;

  if (dtrum) {
    if (preferences.apm === 'on') {
      dtrum.enable();
      dtrum.enableSessionReplay();
    } else {
      dtrum.disableSessionReplay();
      dtrum.disable();
    }
  }
}

function userPreferencesLoaded(preferences: Record<string, string>): void {
  pushCookiePreferences(preferences);
}

function userPreferencesSaved(preferences: Record<string, string>): void {
  showCookiePreferenceSuccess();
  pushCookiePreferences(preferences);
  pushDtrumPreferences(preferences);
}

export function init(): void {
  cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

  cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

  cookieManager.init(cookieManagerConfig);
}
