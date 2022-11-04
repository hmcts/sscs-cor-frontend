import { OK } from 'http-status-codes';
import * as AppInsights from '../app-insights';
import IoRedis, { RedisOptions } from 'ioredis';
const os = require('os');
const healthCheck = require('@hmcts/nodejs-healthcheck');
const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const config = require('config');

const redisConnectionString: string = config.get('session.redis.url');

const redisOptions: RedisOptions = { enableOfflineQueue: false };
const client = new IoRedis(redisConnectionString, redisOptions);

client.on('error', (error) => {
  AppInsights.trackTrace(`Health check failed on redis: ${error}`);
});

const healthTimeout: number = config.get('health.timeout');
const healthDeadline: number = config.get('health.deadline');

const apiUrl: string = config.get('api.url');
const apiHealthUrl = `${apiUrl}/health`;
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
      'mmanage-your-appeal-api': healthCheck.web(
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

export { getHealthConfigure, getReadinessConfigure };
