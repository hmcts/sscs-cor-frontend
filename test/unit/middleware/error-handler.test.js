const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
const { expect, sinon } = require('test/chai-sinon');
const errorHandler = require('app/middleware/error-handler');

/* eslint-disable init-declarations */
describe('middleware/error-handler', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.spy(),
      render: sinon.spy()
    };
  });

  describe('#pageNotFoundHandler', () => {
    it('gives 404 page', () => {
      errorHandler.pageNotFoundHandler(req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });
  });

  describe('#coreErrorHandler', () => {
    it('gives 500 page', () => {
      const error = new Error('Some error');
      errorHandler.coreErrorHandler(error, req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.html');
    });
  });
});
