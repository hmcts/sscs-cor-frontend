import * as request from 'request-promise';
import { OK, SERVICE_UNAVAILABLE } from 'http-status-codes';
import * as AppInsights from '../app-insights';
const { Logger } = require('@hmcts/nodejs-logging');
const healthCheck = require('@hmcts/nodejs-healthcheck');

const logger = Logger.getLogger('health.js');
const apiUrl: string = require('config').get('api.url');

async function getApiHealth(): Promise<string> {
  try {
    const result: request.Response = await request.get({
      uri: `${apiUrl}/health`,
      resolveWithFullResponse: true
    });
    return result.statusCode === OK ? 'UP' : 'DOWN';
  } catch (error) {
    AppInsights.trackException(error.error);
    logger.error('Error trying to check health of API', error.error);
    return 'DOWN';
  }
}

export function livenessCheck(req, res): void {
  res.json(healthCheck.up());
}

export async function readinessCheck(req, res): Promise<void> {
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
