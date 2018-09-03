const { Logger } = require('@hmcts/nodejs-logging');
const session = require('express-session');
const redis = require('connect-redis');
const config = require('config');
import { setup } from 'app/server/app';
import { createSession } from 'app/server/middleware/session';

const logger = Logger.getLogger('server.js');

const port = config.get('node.port');

const RedisStore = redis(session);
const redisOpts = {
  url: config.get('session.redis.url'),
  ttl: config.get('session.redis.ttlInSeconds')
};
const redisStore = new RedisStore(redisOpts);

const app = setup(createSession(redisStore), {});

const server = app.listen(port, (error: Error)  => {
  if (error) {
    logger.error(`Unable to start server because of ${error.message}`);
  } else {
    logger.info(`Server listening on port ${port}`);
  }
});

export default server;