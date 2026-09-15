import { OK } from 'http-status-codes';
import * as AppInsights from '../app-insights';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { createRedisClient } from './redis';
import config from 'config';
import os from 'os';
import healthCheck from '@hmcts/nodejs-healthcheck';
import outputs from '@hmcts/nodejs-healthcheck/healthcheck/outputs';

const logger: LoggerInstance = Logger.getLogger('health');

const client = createRedisClient(false);

client.on('error', (error) => {
  logger.error(`Health check failed on redis: ${error}`);
  AppInsights.trackTrace(`Health check failed on redis: ${error}`);
});

const healthTimeout: number = config.get('health.timeout');
const healthDeadline: number = config.get('health.deadline');

const apiUrl: string = config.get('tribunals-api.url');
const apiHealthUrl = `${apiUrl}/health`;
const hmctsAccessHealthBaseUrl: string =
  config.get('health.idam.url.hmctsAccess') || config.get('idam.hmctsAccess');
const apiReadinessUrl = `${apiHealthUrl}/readiness`;

const healthOptions = (message) => {
  return {
    callback: (error, res) => {
      // eslint-disable-line id-blacklist
      if (error) {
        AppInsights.trackTrace(
          `health_check_error: ${message} and error: ${error}`
        );
      }
      return !error && res.status === OK ? outputs.up() : outputs.down(error);
    },
    timeout: healthTimeout,
    deadline: healthDeadline,
  };
};

function getHealthConfigure() {
  return healthCheck.configure({
    checks: {
      redis: healthCheck.raw(() =>
        client
          .ping()
          .then((_) => healthCheck.status(_ === 'PONG'))
          .catch((error) => {
            AppInsights.trackTrace(`Health check failed on redis: ${error}`);
            return outputs.down(error);
          })
      ),
      'manage-your-appeal-api': healthCheck.web(
        apiHealthUrl,
        healthOptions('Health check failed on manage-your-appeal-api:')
      ),
    },
    buildInfo: {
      name: 'Manage Your Appeal',
      host: os.hostname(),
      uptime: process.uptime(),
    },
  });
}

function getReadinessConfigure() {
  return healthCheck.configure({
    readinessChecks: {
      redis: healthCheck.raw(() =>
        client
          .ping()
          .then((_) => healthCheck.status(_ === 'PONG'))
          .catch((error) => {
            AppInsights.trackTrace(`Readiness check failed on redis: ${error}`);
            return outputs.down(error);
          })
      ),
      'manage-your-appeal-api': healthCheck.web(
        apiReadinessUrl,
        healthOptions('Readiness check failed on manage-your-appeal-api:')
      ),
    },
    buildInfo: {
      name: 'Manage Your Appeal',
      host: os.hostname(),
      uptime: process.uptime(),
    },
  });
}

function getHmctsAccessConfigure() {
  return healthCheck.configure({
    readinessChecks: {
      redis: healthCheck.raw(() =>
        client
          .ping()
          .then((_) => healthCheck.status(_ === 'PONG'))
          .catch((error) => {
            AppInsights.trackTrace(
              `Hmcts Access health check failed on redis: ${error}`
            );
            return outputs.down(error);
          })
      ),
      'manage-your-appeal-api': healthCheck.web(
        hmctsAccessHealthBaseUrl,
        healthOptions(
          'Hmcts Access health check failed on manage-your-appeal-api:'
        )
      ),
    },
    buildInfo: {
      name: 'Manage Your Appeal',
      host: os.hostname(),
      uptime: process.uptime(),
    },
  });
}

export { getHealthConfigure, getReadinessConfigure, getHmctsAccessConfigure };
