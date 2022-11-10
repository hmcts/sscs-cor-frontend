import * as AppInsights from 'app/server/app-insights';

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
const { expect, sinon } = require('test/chai-sinon');
const errorHandler = require('app/server/middleware/error-handler.ts');

describe('middleware/error-handler', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.spy(),
      render: sinon.spy(),
    };
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('#pageNotFoundHandler', () => {
    it('gives 404 page', () => {
      errorHandler.pageNotFoundHandler(req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.njk');
    });
  });

  describe('#sessionNotFoundHandler', () => {
    let next;

    beforeEach(() => {
      next = sinon.spy();
    });

    it('calls next with error if no session can be found', () => {
      errorHandler.sessionNotFoundHandler(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith('Session not found');
    });

    it('calls next when session can be found', () => {
      req.session = {};
      errorHandler.sessionNotFoundHandler(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });
  });

  describe('#coreErrorHandler', () => {
    it('gives 500 page', () => {
      const error = new Error('Some error');
      errorHandler.coreErrorHandler(error, req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(
        INTERNAL_SERVER_ERROR
      );
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.njk');
    });

    it('sends error to app-insights', () => {
      const error = new Error('Some error');
      errorHandler.coreErrorHandler(error, req, res);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });
  });
});

export {};
