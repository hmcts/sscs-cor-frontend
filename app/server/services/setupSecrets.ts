import * as config from 'config';
import { get, set } from 'lodash';

function setSecret (secretPath: string, configPath: string): void {
  // Only overwrite the value if the secretPath is defined
  if (config.has(secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
}

export function setupKeyVaultSecrets (): void {
  if (config.has('secrets.sscs')) {
    setSecret('secrets.sscs.sscs-cor-redis-connection-string', 'session.redis.url');
    setSecret('secrets.sscs.sscs-cor-redis-access-key', 'session.redis.secret');
    setSecret('secrets.sscs.sscs-cor-idam-client-secret', 'idam.client.secret');
    setSecret('secrets.sscs.sscs-s2s-secret', 's2s.secret');
    setSecret('secrets.sscs.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
  }
}
