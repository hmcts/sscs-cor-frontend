import { getConfigurations, createServer, registerServices } from 'dyson';
import { resolve } from 'path';

export function dysonSetupS2s(): void {
  const dysonOptions = {
    configDir: resolve(__dirname, './services/'),
    port: 10000,
  };
  const configs = getConfigurations(dysonOptions);
  const appBefore = createServer(dysonOptions);
  registerServices(appBefore, dysonOptions, configs);
}
