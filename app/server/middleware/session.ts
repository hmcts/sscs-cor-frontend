import * as session from 'express-session';
import { Store } from 'express-session';
import * as ConnectRedis from 'connect-redis';
import { RedisStoreOptions } from 'connect-redis';
import * as config from 'config';
import IoRedis from 'ioredis';
import { RequestHandler } from 'express';

function createRedisStore(): Store {
  const redisConnectionString: string = config.get('session.redis.url');

  const client = new IoRedis(redisConnectionString);

  const ttl: string = config.get('session.redis.ttlInSeconds');
  const redisOpts: RedisStoreOptions = { client, ttl };

  const ConnectRedisStore = ConnectRedis(session);

  return new ConnectRedisStore(redisOpts);
}

function createSession(useRedisStore = false): RequestHandler {
  const isSecure = config.get('session.cookie.secure') === 'true';

  const store: Store = useRedisStore ? createRedisStore() : null;

  return session({
    cookie: {
      httpOnly: true,
      maxAge: config.get('session.cookie.maxAgeInMs'),
      secure: isSecure,
    },
    resave: true,
    saveUninitialized: true,
    secret: config.get('session.redis.secret'),
    rolling: true,
    store,
  });
}

export { createSession };
