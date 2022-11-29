import { getConfigurations, createServer, registerServices } from 'dyson';
import { resolve } from 'path';
import * as multer from 'multer';

const upload = multer();

export function dysonSetupCorBackend(): void {
  const dysonOptions = {
    configDir: resolve(__dirname, './services/'),
    port: 8090,
  };
  const configs = getConfigurations(dysonOptions);
  const appBefore = createServer(dysonOptions);
  appBefore.use(upload.any());
  registerServices(appBefore, dysonOptions, configs);
}
