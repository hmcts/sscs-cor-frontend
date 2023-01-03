import {
  createRedisClient,
  createRedisStore,
} from 'app/server/middleware/redis';
import proxyquire from 'proxyquire';
import config from 'config';
import { cloneDeep } from 'lodash';

import { sinon } from 'test/chai-sinon';

describe('middleware/redis', function () {
  let mockConfig: any = null;

  beforeEach(function () {
    mockConfig = cloneDeep(config);
    const redisProxy = proxyquire('app/server/middleware/redis', {
      config: mockConfig,
    });
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

    it('should run without error with redis secret being null', function () {
      mockConfig.redis.secret = null;

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });

    it('should run without error with tls enabled being true', function () {
      mockConfig.redis.tls = true;

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });

    it('should run without error with tls enabled being false', function () {
      mockConfig.redis.tls = false;

      const redisProxy = proxyquire('app/server/middleware/redis', {
        config: mockConfig,
      });

      redisProxy.createRedisClient();
    });
  });

  describe('#createRedisStore', function () {
    it('should return the correct redis store', function () {
      createRedisStore();
    });
  });
});
