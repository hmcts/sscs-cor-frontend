import * as applicationInsights from 'applicationinsights';
const config = require('config');

export const enable = () => {
  const iKey = config.get('appInsights.instrumentationKey');
  applicationInsights.setup(iKey).setAutoCollectConsole(true, true).start();
};

export const trackException = exception => {
  applicationInsights.defaultClient.trackException({ exception });
};