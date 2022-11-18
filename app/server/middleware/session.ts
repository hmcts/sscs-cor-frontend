import * as session from 'express-session';
import { Store } from 'express-session';
import * as config from 'config';
import { RequestHandler } from 'express';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { createRedisStore } from './redis';

const logger: LoggerInstance = Logger.getLogger('session');

function createSession(useRedisStore = false): RequestHandler {
  const secure: boolean = config.get('session.cookie.secure') === 'true';

  const store: Store = useRedisStore ? createRedisStore() : null;

  const secret: string = config.get('session.redis.secret');

  logger.info(
    `Using redis store with secure cooke: ${secure} secret length: ${secret?.length}`
  );

  return session({
    cookie: {
      httpOnly: true,
      maxAge: config.get('session.cookie.maxAgeInMs'),
      secure,
    },
    resave: true,
    saveUninitialized: true,
    secret: config.get('session.redis.secret'),
    rolling: true,
    store,
  });
}

export { createSession };
