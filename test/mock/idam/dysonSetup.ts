import { getConfigurations, createServer, registerServices } from 'dyson';
import { resolve } from 'path';

export function dysonSetupIdam(): void {
  const dysonOptions = {
    configDir: resolve(__dirname, './services/'),
    port: 8082,
  };
  const configs = getConfigurations(dysonOptions);
  const appBefore = createServer(dysonOptions);
  registerServices(appBefore, dysonOptions, configs);
}
