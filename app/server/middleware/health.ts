import * as AppInsights from '../app-insights';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { createRedisClient } from './redis';
import config from 'config';
import healthCheck from '@hmcts/nodejs-healthcheck';
import outputs from '@hmcts/nodejs-healthcheck/healthcheck/outputs';

const logger: LoggerInstance = Logger.getLogger('health');

const client = createRedisClient(false);

client.on('error', (error) => {
  logger.error(`Health check failed on redis: ${error}`);
  AppInsights.trackTrace(`Health check failed on redis: ${error}`);
});

function getHealthConfigure() {
  return healthCheck.configure({
    checks: {
      'manage-your-appeal-api': healthCheck.web(`${config.api.url}/health`)
    },
    timeout: config.health.timeout,
    deadline: config.health.deadline
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
      'mmanage-your-appeal-api': healthCheck.web(`${config.api.url}/health/readiness`)
    }
  });
}

export { getHealthConfigure, getReadinessConfigure };
