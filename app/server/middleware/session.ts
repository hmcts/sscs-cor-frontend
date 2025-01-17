import session, { Store } from 'express-session';
import config from 'config';
import { RequestHandler } from 'express';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { createRedisStore } from './redis';

const logger: LoggerInstance = Logger.getLogger('session');

export function createSession(useRedisStore = false): RequestHandler {
  const secure: boolean = config.get('session.cookie.secure') === 'true';

  const store: Store = useRedisStore ? createRedisStore() : null;

  const secret: string = config.get('session.cookie.secret');

  logger.info(
    `Using redis store with secure cooke: ${secure} secret length: ${secret?.length}`
  );

  return session({
    cookie: {
      httpOnly: true,
      sameSite: 'lax', // required for the oauth2 redirect
      secure,
      maxAge: config.get('session.cookie.maxAgeInMs'),
    },
    resave: true,
    saveUninitialized: true,
    secret,
    rolling: true,
    store,
  });
}
