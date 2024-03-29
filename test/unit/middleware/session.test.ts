import * as redis from 'app/server/middleware/redis';
import { SinonStub } from 'sinon';
import proxyquire from 'proxyquire';
import config from 'config';
import { cloneDeep } from 'lodash';

import { expect, sinon } from 'test/chai-sinon';
import { createSession } from 'app/server/middleware/session';

process.env.ALLOW_CONFIG_MUTATIONS = 'true';

describe('middleware/session', function () {
  let mockConfig: any = null;

  let redisStub: SinonStub = null;

  beforeEach(function () {
    mockConfig = cloneDeep(config);
    redisStub = sinon.stub(redis, 'createRedisStore').returns(null);
  });

  afterEach(function () {
    redisStub.restore();
    sinon.restore();
  });

  it('should return the correct session when useRedisStore is false', function () {
    createSession(false);

    expect(redisStub).to.have.not.been.called;
  });

  it('should return the correct session when no args are given', function () {
    createSession();

    expect(redisStub).to.have.not.been.called;
  });

  it('should return the correct session when useRedisStore is true', function () {
    createSession(true);

    expect(redisStub).to.have.been.calledOnce;
  });

  it('should return without error when secret is null', function () {
    mockConfig.session.cookie.secret = null;

    const sessionProxy = proxyquire('app/server/middleware/session', {
      config: mockConfig,
    });

    sessionProxy.createSession();
  });
});
