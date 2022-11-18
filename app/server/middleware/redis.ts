import * as session from 'express-session';
import { Store } from 'express-session';
import * as ConnectRedis from 'connect-redis';
import { RedisStoreOptions } from 'connect-redis';
import * as config from 'config';
import IoRedis, { RedisOptions } from 'ioredis';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';

const logger: LoggerInstance = Logger.getLogger('redis');

export function createRedisClient(enableOfflineQueue = true): IoRedis {
  const host: string = config.get('session.redis.host');
  const port: number = config.get('session.redis.port');
  const secret: string = config.get('session.redis.secret');
  const tlsEnabled: boolean = config.get('session.redis.tls');

  logger.info(
    `Creating redis using host: ${host}, redisPort: ${port}, tls: ${tlsEnabled}, secret length: ${secret?.length}`
  );

  let redisOptions: RedisOptions = {
    host,
    port,
    password: secret,
    enableOfflineQueue,
  };

  if (tlsEnabled) {
    logger.info(`Using tls settings`);
    redisOptions = {
      host,
      port,
      password: secret,
      tls: {
        host,
      },
      enableOfflineQueue,
    };
  }

  const client = new IoRedis(redisOptions);

  logger.info(`Redis client created`);

  return client;
}

export function createRedisStore(): Store {
  const client = createRedisClient();

  client.on('error', (error) => {
    logger.error(`Redis Store connection failed on redis: ${error}`);
    AppInsights.trackTrace(`Redis Store connection failed on redis: ${error}`);
  });

  const ttl: string = config.get('session.redis.ttlInSeconds');
  const redisOpts: RedisStoreOptions = { client, ttl };

  const ConnectRedisStore = ConnectRedis(session);

  return new ConnectRedisStore(redisOpts);
}
