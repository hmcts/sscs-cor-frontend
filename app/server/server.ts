import * as config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { setupKeyVaultSecrets } from './services/setupSecrets';

propertiesVolume.addTo(config);

// Setup secrets before loading the app
setupKeyVaultSecrets();

const { Logger } = require('@hmcts/nodejs-logging');

/* eslint-disable import/first */
import * as session from 'express-session';
import * as redis from 'connect-redis';
import { setup } from './app';
import { createSession } from './middleware/session';

const logger = Logger.getLogger('server.js');

const port = config.get('node.port');

const RedisStore = redis(session);
const redisOpts: redis.RedisStoreOptions = {
  url: config.get('session.redis.url'),
  ttl: config.get('session.redis.ttlInSeconds'),
};
const redisStore: session.Store = new RedisStore(redisOpts);

const app = setup(createSession(redisStore), {});

const server = app
  .listen(port, () => logger.info(`Server  listening on port ${port}`))
  .on('error', (error: Error) =>
    logger.error(`Unable to start server because of ${error.message}`)
  );

export default server;
