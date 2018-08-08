const { expect, sinon } = require('test/chai-sinon');
const health = require('app/middleware/health');

/* eslint-disable init-declarations */
describe('middleware/health', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      json: sinon.spy()
    };
  });

  it('returns JSON with health status, with redis down', () => {
    health(req, res);
    expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP', redisStatus: 'DOWN' });
  });

  it('returns JSON with health status, with redis up', () => {
    req.session = {};
    health(req, res);
    expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP', redisStatus: 'UP' });
  });
});
