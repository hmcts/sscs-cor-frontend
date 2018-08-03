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

  it('returns JSON with health status', () => {
    health(req, res);
    expect(res.json).to.have.been.calledOnce.calledWith({ status: 'UP' });
  });
});
