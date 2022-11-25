import session, { Store } from 'express-session';
import ConnectRedis, { RedisStoreOptions } from 'connect-redis';
import config from 'config';
import IoRedis, { RedisOptions } from 'ioredis';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { ConnectionOptions } from 'tls';

const logger: LoggerInstance = Logger.getLogger('redis');

export function createRedisClient(enableOfflineQueue = true): IoRedis {
  const host: string = config.get('redis.host');
  const port: number = config.get('redis.port');
  const secret: string = config.get('redis.secret');
  const connectTimeout: number = config.get('redis.timeout');
  const tlsEnabled: boolean = config.get('redis.tls') === true;

  logger.info(
    `Creating redis using host: ${host}, redisPort: ${port}, tls: ${tlsEnabled}, secret length: ${secret?.length}, timeout: ${connectTimeout}`
  );

  const tls: ConnectionOptions = tlsEnabled ? { host } : null;

  const redisOptions: RedisOptions = {
    host,
    port,
    password: secret,
    tls,
    enableOfflineQueue,
    connectTimeout,
  };

  const client = new IoRedis(redisOptions);

  return client;
}

export function createRedisStore(): Store {
  const client = createRedisClient();

  client.on('error', (error) => {
    logger.error(`Redis Store connection failed on redis: ${error}`);
    AppInsights.trackTrace(`Redis Store connection failed on redis: ${error}`);
  });

  const ttl: string = config.get('redis.ttlInSeconds');

  logger.info(`Redis Store ttl: ${ttl}`);

  const redisOpts: RedisStoreOptions = { client, ttl };

  const ConnectRedisStore = ConnectRedis(session);

  return new ConnectRedisStore(redisOpts);
}
