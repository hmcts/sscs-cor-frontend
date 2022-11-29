export const microsoft = {
  // IE11 extremely unstable on TIDAM - retry once SIDAM is in use. (22/02/19)
  // ie11: {
  //   browserName: 'internet explorer',
  //   name: 'IE11',
  //   platform: 'Windows 10',
  //   ignoreZoomSetting: true,
  //   nativeEvents: false,
  //   ignoreProtectedModeSettings: true,
  //   version: '11.285'
  // },
  edge: {
    browserName: 'MicrosoftEdge',
    name: 'Edge',
    platform: 'Windows 10',
    ignoreZoomSetting: true,
    nativeEvents: false,
    ignoreProtectedModeSettings: true,
    version: '17.17134',
  },
};

export const chrome = {
  chrome_win_latest: {
    browserName: 'chrome',
    name: 'WIN_CHROME_LATEST',
    platform: 'Windows 10',
    version: 'latest',
  },
  chrome_mac_latest: {
    browserName: 'chrome',
    name: 'MAC_CHROME_LATEST',
    platform: 'macOS 10.13',
    version: 'latest',
  },
};

export const firefox = {
  firefox_win_latest: {
    browserName: 'firefox',
    name: 'WIN_FIREFOX_LATEST',
    platform: 'Windows 10',
    version: 'latest',
  },
  firefox_mac_latest: {
    browserName: 'firefox',
    name: 'MAC_FIREFOX_LATEST',
    platform: 'macOS 10.13',
    version: 'latest',
  },
};

export const safari = {
  safari11: {
    browserName: 'safari',
    name: 'SAFARI_11',
    platform: 'macOS 10.14',
    version: 'latest',
    avoidProxy: true,
  },
};
