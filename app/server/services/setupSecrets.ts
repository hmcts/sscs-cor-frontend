import * as config from 'config';
import { get, set } from 'lodash';
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('commong.js');

function setSecret (secretPath: string, configPath: string): void {
  // Only overwrite the value if the secretPath is defined
  if (config.has(secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
}

export function setupKeyVaultSecrets (): void {
  logger.info('Before setting up secrets');
  logger.info('config.has(\'secrets.sscs\') ' + config.has('secrets.sscs'));
  if (config.has('secrets.sscs')) {
    logger.info('after setting up secrets');
    setSecret('secrets.sscs.sscs-cor-redis-connection-string', 'session.redis.url');
    setSecret('secrets.sscs.sscs-cor-redis-access-key', 'session.redis.secret');
    setSecret('secrets.sscs.idam-sscs-oauth2-client-secret', 'idam.client.secret');
    setSecret('secrets.sscs.sscs-s2s-secret', 's2s.secret');
    setSecret('secrets.sscs.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
  }
}
