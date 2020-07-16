import { OK } from 'http-status-codes';
import * as AppInsights from '../app-insights';
const ioRedis = require('ioredis');
const os = require('os');
const healthCheck = require('@hmcts/nodejs-healthcheck');
const outputs = require('@hmcts/nodejs-healthcheck/healthcheck/outputs');
const config = require('config');

const client = ioRedis.createClient(
        config.session.redis.url,
        { enableOfflineQueue: false }
);

client.on('error', error => {
  AppInsights.trackTrace(`Health check failed on redis: ${error}`);
});

const healthOptions = message => {
  return {
    callback: (error, res) => { // eslint-disable-line id-blacklist
      if (error) {
        AppInsights.trackTrace(`health_check_error: ${message} and error: ${error}`);
      }
      return !error && res.status === OK ? outputs.up() : outputs.down(error);
    },
    timeout: config.health.timeout,
    deadline: config.health.deadline
  };
};

function getHealthConfigure() {
  return healthCheck.configure({
    checks: {
      redis: healthCheck.raw(() => client.ping().then(_ => healthCheck.status(_ === 'PONG'))
      .catch(error => {
        AppInsights.trackTrace(`Health check failed on redis: ${error}`);
        return outputs.down(error);
      })),
      'submit-your-appeal-api': healthCheck.web(`${config.api.url}/health`,
              healthOptions('Health check failed on submit-your-appeal-api:')
      )
    },
    buildInfo: {
      name: 'Manage Your Appeal',
      host: os.hostname(),
      uptime: process.uptime()
    }
  });
}

function getReadinessConfigure() {
  return healthCheck.configure({
    readinessChecks: {
      redis: healthCheck.raw(() => client.ping().then(_ => healthCheck.status(_ === 'PONG'))
      .catch(error => {
        AppInsights.trackTrace(`Readiness check failed on redis: ${error}`);
        return outputs.down(error);
      })),
      'submit-your-appeal-api': healthCheck.web(`${config.api.url}/health/readiness`,
              healthOptions('Readiness check failed on submit-your-appeal-api:')
      )
    },
    buildInfo: {
      name: 'Manage Your Appeal',
      host: os.hostname(),
      uptime: process.uptime()
    }
  });
}

export {
  getHealthConfigure, getReadinessConfigure
};
