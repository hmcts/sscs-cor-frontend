const request = require('superagent');
const { OK, SERVICE_UNAVAILABLE } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
const { Logger } = require('@hmcts/nodejs-logging');
const healthCheck = require('@hmcts/nodejs-healthcheck');

const logger = Logger.getLogger('health.js');
const apiUrl = require('config').get('api.url');

async function getApiHealth() {
  try {
    const result = await request.get(`${apiUrl}/health`);
    return result.status === OK ? 'UP' : 'DOWN';
  } catch (error) {
    AppInsights.trackException(error);
    logger.error('Error trying to check health of API', error);
    return 'DOWN';
  }
}

function livenessCheck(req, res) {
  res.json(healthCheck.up());
}

async function readinessCheck(req, res) {
  const redisStatus = req.session ? 'UP' : 'DOWN';
  const apiStatus = await getApiHealth();
  let appStatus = healthCheck.up();
  let statusCode = OK;
  if (redisStatus === 'DOWN' || apiStatus === 'DOWN') {
    appStatus = healthCheck.down();
    statusCode = SERVICE_UNAVAILABLE;
  }
  const status = { ...appStatus, ...{ redisStatus, apiStatus } };
  res.status(statusCode);
  res.json(status);
}

export { livenessCheck, readinessCheck };
