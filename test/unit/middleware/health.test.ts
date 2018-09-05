const { expect, sinon } = require('test/chai-sinon');
const nock = require('nock');
const { OK, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE } = require('http-status-codes');
const appInsights = require('app/server/app-insights');
const config = require('config');
const { livenessCheck, readinessCheck } = require('app/server/middleware/health.ts');

const apiUrl = config.get('api.url');

describe('middleware/health', () => {
  let req;
  let res;

  describe('#livenessCheck', () => {
    beforeEach(() => {
      req = {
        session: {}
      };
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
    });

    it('returns JSON with health status UP', async() => {
      await livenessCheck(req, res);
      expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP' });
    });
  });

  describe('#readinessCheck', () => {
    const apiPath = '/health';
    const apiResponse = {
      status: 'UP'
    };

    beforeEach(() => {
      req = {
        session: {}
      };
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      sinon.stub(appInsights, 'trackException');
    });

    afterEach(() => {
      appInsights.trackException.restore();
    });

    it('returns JSON with health status UP', async() => {
      nock(apiUrl).get(apiPath).reply(OK, apiResponse);
      await readinessCheck(req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(OK);
      expect(res.json).to.have.been.calledOnce.calledWith({
        status: 'UP',
        redisStatus: 'UP',
        apiStatus: 'UP'
      });
    });

    it('returns JSON with health status DOWN, with redis down', async() => {
      nock(apiUrl).get(apiPath).reply(OK, apiResponse);
      delete req.session;
      await readinessCheck(req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(SERVICE_UNAVAILABLE);
      expect(res.json).to.have.been.calledOnce.calledWith({
        status: 'DOWN',
        redisStatus: 'DOWN',
        apiStatus: 'UP'
      });
    });

    it('returns JSON with health status DOWN, with API down', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      nock(apiUrl).get(apiPath).replyWithError(error);
      await readinessCheck(req, res);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(res.status).to.have.been.calledOnce.calledWith(SERVICE_UNAVAILABLE);
      expect(res.json).to.have.been.calledOnce.calledWith({
        status: 'DOWN',
        redisStatus: 'UP',
        apiStatus: 'DOWN'
      });
    });
  });
});

export {};