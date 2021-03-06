import * as applicationInsights from 'applicationinsights';
const config = require('config');

export const enable = () => {
  const iKey = config.get('appInsights.instrumentationKey');
  applicationInsights.setup(iKey).setAutoCollectConsole(true, true)
    .setDistributedTracingMode(applicationInsights.DistributedTracingModes.AI_AND_W3C)
    .setSendLiveMetrics(true);
  applicationInsights
    .defaultClient
    .context
    .tags[applicationInsights.defaultClient.context.keys.cloudRole] = config.get('appInsights.roleName');
  applicationInsights.start();
};

export const trackException = exception => {
  if (applicationInsights.defaultClient) {
    applicationInsights.defaultClient.trackException({ exception });
  }
};

export const trackEvent = name => {
  if (applicationInsights.defaultClient) {
    applicationInsights.defaultClient.trackEvent({ name });
  }
};

export const trackTrace = message => {
  if (applicationInsights.defaultClient) {
    applicationInsights.defaultClient.trackTrace({ message });
  }
};
