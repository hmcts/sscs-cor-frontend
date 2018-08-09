const request = require('superagent');
const { OK } = require('http-status-codes');
const appInsights = require('app-insights');
const { Logger } = require('@hmcts/nodejs-logging');
const healthCheck = require('@hmcts/nodejs-healthcheck');

const logger = Logger.getLogger('health.js');
const apiUrl = require('config').get('api.url');

async function getApiHealth() {
  try {
    const result = await request.get(`${apiUrl}/health`);
    return result.status === OK ? 'UP' : 'DOWN';
  } catch (error) {
    appInsights.trackException(error);
    logger.error('Error trying to check health of API', error);
    return 'DOWN';
  }
}

module.exports = async(req, res) => {
  const redisStatus = req.session ? 'UP' : 'DOWN';
  const apiStatus = await getApiHealth();
  const status = { ...healthCheck.up(), ...{ redisStatus, apiStatus } };
  res.json(status);
};
