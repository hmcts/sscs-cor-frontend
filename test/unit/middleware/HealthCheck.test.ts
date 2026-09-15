import proxyquire from 'proxyquire';
import { expect } from 'chai';
import { sinon } from 'test/chai-sinon';

describe('middleware/health', function () {
  let configureStub: sinon.SinonStub;
  let webStub: sinon.SinonStub;
  let rawStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;
  let upStub: sinon.SinonStub;
  let downStub: sinon.SinonStub;
  let clientStub: any;
  let configValues: Record<string, any>;
  let healthModule: any;

  beforeEach(function () {
    configureStub = sinon.stub().returns({ configured: true });
    webStub = sinon.stub().callsFake((url: string, options: any) => ({
      url,
      options,
      kind: 'web',
    }));
    rawStub = sinon
      .stub()
      .callsFake((fn: () => Promise<any>) => ({ callback: fn, kind: 'raw' }));
    statusStub = sinon
      .stub()
      .callsFake((healthy: boolean) => ({ healthy, kind: 'status' }));
    upStub = sinon.stub().returns('UP');
    downStub = sinon.stub().returns('DOWN');
    clientStub = {
      on: sinon.stub(),
      ping: sinon.stub().resolves('PONG'),
    };
    configValues = {
      'health.timeout': 3000,
      'health.deadline': 6000,
      'tribunals-api.url': 'https://tribunals.example',
      'health.idam.url.hmctsAccess': 'https://hmcts-access.example',
    };

    healthModule = proxyquire('app/server/middleware/health', {
      config: {
        __esModule: true,
        default: { get: (key: string) => configValues[key] },
        get: (key: string) => configValues[key],
      },
      './redis': {
        createRedisClient: () => clientStub,
      },
      '../app-insights': {
        __esModule: true,
        trackTrace: sinon.stub(),
      },
      '@hmcts/nodejs-logging': {
        Logger: {
          getLogger: () => ({
            error: sinon.stub(),
          }),
        },
      },
      '@hmcts/nodejs-healthcheck': {
        __esModule: true,
        default: {
          configure: configureStub,
          web: webStub,
          raw: rawStub,
          status: statusStub,
        },
        configure: configureStub,
        web: webStub,
        raw: rawStub,
        status: statusStub,
      },
      '@hmcts/nodejs-healthcheck/healthcheck/outputs': {
        __esModule: true,
        default: {
          up: upStub,
          down: downStub,
        },
        up: upStub,
        down: downStub,
      },
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('configures the main health endpoint with redis and API checks', async function () {
    const result = healthModule.getHealthConfigure();

    expect(result).to.deep.equal({ configured: true });
    expect(configureStub.calledOnce).to.equal(true);

    const configArg = configureStub.firstCall.args[0];
    expect(configArg.checks.redis.kind).to.equal('raw');
    expect(configArg.checks['manage-your-appeal-api'].kind).to.equal('web');
    expect(configArg.checks['manage-your-appeal-api'].url).to.equal(
      'https://tribunals.example/health'
    );
    expect(configArg.buildInfo.name).to.equal('Manage Your Appeal');
    expect(configArg.buildInfo.host).to.be.a('string');
    expect(configArg.buildInfo.uptime).to.be.a('number');

    const redisResult = await configArg.checks.redis.callback();
    expect(clientStub.ping.calledOnce).to.equal(true);
    expect(statusStub.calledWith(true)).to.equal(true);
    expect(redisResult).to.deep.equal({ healthy: true, kind: 'status' });
  });

  it('configures readiness checks against the readiness endpoint', function () {
    healthModule.getReadinessConfigure();

    const configArg = configureStub.firstCall.args[0];
    expect(configArg.readinessChecks.redis.kind).to.equal('raw');
    expect(configArg.readinessChecks['manage-your-appeal-api'].url).to.equal(
      'https://tribunals.example/health/readiness'
    );
    expect(configArg.buildInfo.name).to.equal('Manage Your Appeal');
  });

  it('configures hmcts access readiness checks with the hmcts access URL', function () {
    healthModule.getHmctsAccessConfigure();

    const configArg = configureStub.firstCall.args[0];
    expect(configArg.readinessChecks.redis.kind).to.equal('raw');
    expect(configArg.readinessChecks['manage-your-appeal-api'].url).to.equal(
      'https://hmcts-access.example'
    );
    expect(configArg.buildInfo.name).to.equal('Manage Your Appeal');
  });

  it('returns the UP sentinel for a successful web callback and the DOWN sentinel for errors', function () {
    healthModule.getHealthConfigure();

    const configArg = configureStub.firstCall.args[0];
    const callback =
      configArg.checks['manage-your-appeal-api'].options.callback;

    const success = callback(undefined, { status: 200 });
    expect(upStub.calledOnce).to.equal(true);
    expect(success).to.equal('UP');

    const failure = callback(new Error('boom'), undefined);
    expect(downStub.calledOnce).to.equal(true);
    expect(failure).to.equal('DOWN');
  });
});
