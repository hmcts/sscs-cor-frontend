import * as config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { setupKeyVaultSecrets } from './services/setupSecrets';

propertiesVolume.addTo(config);

// Setup secrets before loading the app
setupKeyVaultSecrets();

const { Logger } = require('@hmcts/nodejs-logging');

import { setup } from './app';
import { createSession } from './middleware/session';
const logger = Logger.getLogger('server.js');

const port = config.get('node.port');

const app = setup(createSession(true), {});

const server = app
  .listen(port, () => logger.info(`Server  listening on port ${port}`))
  .on('error', (error: Error) =>
    logger.error(`Unable to start server because of ${error.message}`)
  );

export default server;
