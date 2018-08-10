const { expect, sinon } = require('test/chai-sinon');
const nock = require('nock');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app-insights');
const config = require('config');
const health = require('app/middleware/health');

const apiUrl = config.get('api.url');

/* eslint-disable init-declarations */
describe('middleware/health', () => {
  let req;
  let res;
  const path = '/health';
  const apiResponse = {
    status: 'UP'
  };

  beforeEach(() => {
    req = {
      session: {}
    };
    res = {
      json: sinon.spy()
    };
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  it('returns JSON with health status', async() => {
    nock(apiUrl).get(path).reply(OK, apiResponse);
    await health(req, res);
    expect(res.json).to.have.been.calledOnce.calledWith({
      status: 'UP',
      redisStatus: 'UP',
      apiStatus: 'UP'
    });
  });

  it('returns JSON with health status, with redis down', async() => {
    nock(apiUrl).get(path).reply(OK, apiResponse);
    delete req.session;
    await health(req, res);
    expect(res.json).to.have.been.calledOnce.calledWith({
      status: 'UP',
      redisStatus: 'DOWN',
      apiStatus: 'UP'
    });
  });

  it('returns JSON with health status, with API down', async() => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
    nock(apiUrl).get(path).replyWithError(error);
    await health(req, res);
    expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
    expect(res.json).to.have.been.calledOnce.calledWith({
      status: 'UP',
      redisStatus: 'UP',
      apiStatus: 'DOWN'
    });
  });
});
