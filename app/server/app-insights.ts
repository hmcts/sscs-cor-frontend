import {
  setup as inSetup,
  start as inStart,
  defaultClient,
  DistributedTracingModes,
} from 'applicationinsights';
import config from 'config';

const iKey: string = config.get('appInsights.connectionString');
const roleName: string = config.get('appInsights.roleName');

export function enable(): void {
  inSetup(iKey)
    .setAutoCollectConsole(true, true)
    .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
    .setSendLiveMetrics(true);
  defaultClient.context.tags[defaultClient.context.keys.cloudRole] = roleName;
  inStart();
}

export function trackException(exception: Error): void {
  defaultClient?.trackException({ exception });
}

export function trackEvent(name: string): void {
  defaultClient?.trackEvent({ name });
}

export function trackTrace(message: string): void {
  defaultClient?.trackTrace({ message });
}
