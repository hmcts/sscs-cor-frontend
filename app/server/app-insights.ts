import * as applicationInsights from 'applicationinsights';
const config = require('config');

export const enable = () => {
  const iKey = config.get('appInsights.instrumentationKey');
  applicationInsights.setup(iKey).setAutoCollectConsole(true, true);
  applicationInsights
    .defaultClient
    .context
    .tags[applicationInsights.defaultClient.context.keys.cloudRole] = config.get('appInsights.roleName');
  applicationInsights.start();
};

export const trackException = exception => {
  // tslint:disable-next-line: no-console
  console.log(exception);
  applicationInsights.defaultClient.trackException({ exception });
};
