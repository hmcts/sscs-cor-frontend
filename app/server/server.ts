import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { setupKeyVaultSecrets } from './services/setupSecrets';
import { Logger } from '@hmcts/nodejs-logging';
import { LoggerInstance } from 'winston';
import { Application } from 'express';

propertiesVolume.addTo(config);

// Setup secrets before loading the app
setupKeyVaultSecrets();

import { setupApp } from './app';
import { createSession } from './middleware/session';

const logger: LoggerInstance = Logger.getLogger('server.js');

const port: number = config.get('node.port');

const server = setupApp(createSession(true), true).then((app: Application) => {
  return app
    .listen(port, () => logger.info(`Server  listening on port ${port}`))
    .on('error', (error: Error) =>
      logger.error(`Unable to start server because of ${error.message}`)
    );
});

export default server;
