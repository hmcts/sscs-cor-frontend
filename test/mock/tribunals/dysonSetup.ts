import dyson from 'dyson';
import path from 'path';

export function dysonSetupTribunals(): void {
  const dysonOptions = {
    configDir: path.resolve(__dirname, './services/'),
    port: 8083,
  };
  const configs = dyson.getConfigurations(dysonOptions);
  const appBefore = dyson.createServer(dysonOptions);
  dyson.registerServices(appBefore, dysonOptions, configs);
}
