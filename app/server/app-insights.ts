import {
  setup as inSetup,
  start as inStart,
  defaultClient,
  DistributedTracingModes,
} from 'applicationinsights';
import config from 'config';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import { toErrorMessage } from './exceptions/HttpException';

const logger: LoggerInstance = Logger.getLogger('app-insights.js');

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

function normaliseException(exception: Error): Error {
  if (
    typeof exception?.message === 'string' &&
    typeof exception?.name === 'string'
  ) {
    return exception;
  }
  const normalised = new Error(toErrorMessage(exception?.message ?? exception));
  normalised.name =
    exception?.name === undefined || exception?.name === null
      ? 'Error'
      : toErrorMessage(exception.name);
  if (exception?.stack) {
    normalised.stack = exception.stack;
  }
  return normalised;
}

export function trackException(exception: Error): void {
  try {
    defaultClient?.trackException({
      exception: normaliseException(exception),
    });
  } catch (error) {
    logger.error(`Failed to track exception in App Insights: ${error}`);
  }
}

export function trackEvent(name: string): void {
  defaultClient?.trackEvent({ name });
}

export function trackTrace(message: string): void {
  defaultClient?.trackTrace({ message });
}
