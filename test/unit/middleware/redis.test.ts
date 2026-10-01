import {
  createRedisClient,
  createRedisStore,
} from 'app/server/middleware/redis';
import proxyquire from 'proxyquire';
import config from 'config';
import { cloneDeep } from 'lodash';

import { expect, sinon } from 'test/chai-sinon';

describe('middleware/redis', function () {
  let mockConfig: any = null;

  beforeEach(function () {
    mockConfig = cloneDeep(config);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#createRedisClient', function () {
    it('should return the correct redis client when createRedisClient is false', function () {
      createRedisClient(false);
    });

    it('should return the correct redis client when no args are given', function () {
      createRedisClient();
    });

    it('should return the correct redis client when createRedisClient is true', function () {
      createRedisClient(true);
    });

    it('should run without error with redis password being null', function () {
      mockConfig.redis.url = 'redis://127.0.0.1:6379';

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });

    it('should run without error with tls enabled', function () {
      mockConfig.redis.url = 'rediss://:redisPassword@redis.example.com:6380';

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });

    it('should run without error with tls disabled', function () {
      mockConfig.redis.url = 'redis://:redisPassword@127.0.0.1:6379';

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });

    it('should create a redis cluster client when cluster is enabled', function () {
      mockConfig.redis.url = 'rediss://:redisPassword@redis.example.com:6380';
      mockConfig.redis.cluster = true;

      const clusterClient = {
        isCluster: true,
      };

      const ClusterStub = sinon.stub().returns(clusterClient);

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
        ioredis: {
          default: sinon.stub(),
          Cluster: ClusterStub,
        },
      });

      const client = redisProxy.createRedisClient();

      expect(client.isCluster).to.equal(true);
      expect(ClusterStub.calledOnce).to.equal(true);
      expect(
        ClusterStub.calledWith(
          [
            {
              host: 'redis.example.com',
              port: 6380,
            },
          ],
          sinon.match({
            redisOptions: sinon.match({
              host: 'redis.example.com',
              port: 6380,
              password: 'redisPassword',
            }),
          })
        )
      ).to.equal(true);
    });
  });

  describe('#createRedisStore', function () {
    it('should return the correct redis store', function () {
      createRedisStore();
    });
  });
});
