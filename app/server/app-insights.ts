const applicationInsights = require('applicationinsights');
const config = require('config');

export namespace AppInsights {
  export const enable = () => {
    const iKey = config.get('appInsights.instrumentationKey');
    applicationInsights.setup(iKey).setAutoCollectConsole(true, true).start();
  };

  export const trackException = exception => {
    applicationInsights.defaultClient.trackException({ exception });
  };
}