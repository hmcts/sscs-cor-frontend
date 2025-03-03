import * as AppInsights from 'app/server/app-insights';
import {
  BAD_REQUEST,
  FORBIDDEN,
  GATEWAY_TIMEOUT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import * as errorHandler from 'app/server/middleware/error-handler';
import { Session, SessionData } from 'express-session';
import HttpException from 'app/server/exceptions/HttpException';

import { expect, sinon } from 'test/chai-sinon';

describe('middleware/error-handler', function () {
  const req: Request = {
    originalUrl: 'https://test.com',
  } as Request;
  let res: Response = {} as Response;
  let next: NextFunction = null;

  beforeEach(function () {
    res = {
      status: sinon.spy(),
      render: sinon.spy(),
    } as Partial<Response> as Response;
    next = sinon.spy();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackTrace');
  });

  afterEach(function () {
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackTrace as sinon.SinonStub).restore();
  });

  describe('#pageNotFoundHandler', function () {
    it('gives 404 page', function () {
      errorHandler.pageNotFoundHandler(req, res);
      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk');
    });
  });

  describe('#sessionNotFoundHandler', function () {
    let next;

    beforeEach(function () {
      next = sinon.spy();
    });

    it('calls next with error if no session can be found', function () {
      errorHandler.sessionNotFoundHandler(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith('Session not found');
    });

    it('calls next when session can be found', function () {
      req.session = {} as SessionData as Session;
      errorHandler.sessionNotFoundHandler(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });
  });

  describe('#forbiddenHandler', function () {
    const error = new HttpException(FORBIDDEN, 'forbiddenMessage');

    it('gives 403 page', function () {
      errorHandler.forbiddenHandler(error, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(FORBIDDEN);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk');
    });

    it('no error returns next', function () {
      errorHandler.forbiddenHandler(
        new HttpException(500, 'notCorrectError'),
        req,
        res,
        next
      );
      expect(res.render).to.have.not.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('sends error to app-insights', function () {
      errorHandler.forbiddenHandler(error, req, res, next);
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `${error.status} Error from request ${req.originalUrl}, error: ${error}`
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });
  });

  describe('#badRequestHandler', function () {
    const error = new HttpException(BAD_REQUEST, 'badRequestMessage');

    it('gives 400 page', function () {
      errorHandler.badRequestHandler(error, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(BAD_REQUEST);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk');
    });

    it('no error returns next', function () {
      errorHandler.badRequestHandler(
        new HttpException(INTERNAL_SERVER_ERROR, 'notCorrectError'),
        req,
        res,
        next
      );
      expect(res.render).to.have.not.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('sends error to app-insights', function () {
      errorHandler.badRequestHandler(error, req, res, next);
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `${error.status} Error from request ${req.originalUrl}, error: ${error}`
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });
  });

  describe('#gatewayTimeoutHandler', function () {
    const error = new HttpException(GATEWAY_TIMEOUT, 'gatewayTimeoutMessage');

    it('gives 504 page', function () {
      errorHandler.gatewayTimeoutHandler(error, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(GATEWAY_TIMEOUT);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk');
    });

    it('no error returns next', function () {
      errorHandler.gatewayTimeoutHandler(
        new HttpException(INTERNAL_SERVER_ERROR, 'notCorrectError'),
        req,
        res,
        next
      );
      expect(res.render).to.have.not.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('sends error to app-insights', function () {
      errorHandler.gatewayTimeoutHandler(error, req, res, next);
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `${error.status} Error from request ${req.originalUrl}, error: ${error}`
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });
  });

  describe('#coreErrorHandler', function () {
    it('gives 500 page', function () {
      const error = new Error('Some error');
      errorHandler.coreErrorHandler(error, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(
        INTERNAL_SERVER_ERROR
      );
      expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk');
    });

    it('sends error to app-insights', function () {
      const error = new Error('Some error');
      errorHandler.coreErrorHandler(error, req, res, next);
      expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
        `undefined Error from request ${req.originalUrl}, error: ${error}`
      );
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });
  });
});
