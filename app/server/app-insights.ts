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
  // tslint:disable-next-line: no-console
  console.log(exception);
  applicationInsights.defaultClient.trackException({ exception });
};

export const trace = (messageInfo, label, severity = 1,properties = {}, postToAppInsights = true) => {
  // tslint:disable-next-line: no-console
  const msg = this.msgBuilder(messageInfo, label);
  applicationInsights.defaultClient.trackTrace({
    message: msg,
    severity,
    properties
  });
};
