import session, { Store } from 'express-session';
import ConnectRedis, { RedisStoreOptions } from 'connect-redis';
import config from 'config';
import IoRedis, { Cluster, RedisOptions } from 'ioredis';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import * as AppInsights from '../app-insights';
import { ConnectionOptions } from 'tls';

const logger: LoggerInstance = Logger.getLogger('redis');

export function createRedisClient(
  enableOfflineQueue = true
): IoRedis | Cluster {
  const redisUrl: string = config.get('redis.url');
  const redisHost: string = config.get('redis.host');
  const redisPort: number = config.get('redis.port');
  const connectTimeout: number = config.get('redis.timeout');
  const clusterEnabled: boolean = config.get('redis.cluster') === true;

  const url = redisUrl ? new URL(redisUrl) : null;

  const host = url?.hostname || redisHost;
  const port = url?.port ? Number(url.port) : redisPort;
  const secret = url?.password ? decodeURIComponent(url.password) : undefined;
  const tlsEnabled = url?.protocol === 'rediss:';

  logger.info(
    `Creating redis using host: ${host}, redisPort: ${port}, tls: ${tlsEnabled}, cluster: ${clusterEnabled}, secret length: ${secret?.length}, timeout: ${connectTimeout}`
  );

  const tls: ConnectionOptions = tlsEnabled
    ? {
        host,
        servername: host,
      }
    : null;

  const redisOptions: RedisOptions = {
    host,
    port,
    password: secret,
    tls,
    enableOfflineQueue,
    connectTimeout,
  };

  if (clusterEnabled) {
    return new Cluster(
      [
        {
          host,
          port,
        },
      ],
      {
        redisOptions,
      }
    );
  }

  return new IoRedis(redisOptions);
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
