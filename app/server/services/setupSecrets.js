const config = require('@hmcts/properties-volume').addTo(require('config'));
const { get, set } = require('lodash');

const setSecret = (secretPath, configPath) => {
  // Only overwrite the value if the secretPath is defined
  if (config.has(secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

const setupSecrets = () => {
  if (config.has('secrets.sscs')) {
    setSecret('secrets.sscs.sscs-cor-redis-connection-string', 'redis.url');
    setSecret('secrets.sscs.sscs-cor-redis-access-key', 'session.secret');
    setSecret('secrets.sscs.sscs-cor-idam-client-secret', 'idam.client.secret');
    setSecret('secrets.sscs.sscs-s2s-secret', 's2s.secret');
    setSecret('secrets.sscs.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
  }
};

module.exports = setupSecrets;