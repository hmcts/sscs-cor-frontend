import config from 'config';
import { validateToken } from 'app/server/services/tokenService';
import { expect, sinon } from 'test/chai-sinon';
import { Request, Response, NextFunction } from 'express';
import { SessionData } from 'express-session';

import superagent, { SuperAgentRequest } from 'superagent';
import { SinonStub } from 'sinon';
import { after } from 'mocha';
import { ParamsDictionary } from 'express-serve-static-core';

const apiUrl: string = config.get('tribunals-api.url');

describe('services/tokenService', function () {
  const session: SessionData = {
    accessToken: 'someUserToken',
    serviceToken: 'someServiceToken',
  } as Partial<SessionData> as SessionData;
  const body = {
    email: 'test@test.com',
  };
  const mactoken = '1234567';
  const params: ParamsDictionary = {
    mactoken,
  };
  const req = {
    session,
    body,
    params,
  } as Request;
  const appealId = '1234';
  const subscriptionId = '5678';
  const locals: Record<string, Record<string, string>> = {
    token: {
      appealId,
      subscriptionId,
    },
  };
  const res = {
    locals,
  } as Response;
  let next: NextFunction = null;
  let getRequest: SinonStub;
  let sendStub: SinonStub;
  let thenStub: SinonStub;

  before(function () {
    thenStub = sinon.stub();
    sendStub = sinon.stub().returns({
      then: thenStub,
    });
    getRequest = sinon.stub(superagent, 'get').returns({
      then: thenStub,
    } as Partial<SuperAgentRequest> as SuperAgentRequest);
    next = sinon.stub().resolves();
  });

  after(function () {
    sinon.reset();
  });

  describe('validateToken', function () {
    const endpoint = `${apiUrl}/tokens/${mactoken}`;

    beforeEach(function () {
      thenStub.resolves(Promise<void>);
      params.mactoken = mactoken;
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    it('should validateToken', function () {
      validateToken(req, res, next);
      expect(getRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(thenStub).to.have.been.calledOnce;
    });

    it('should catch on request error', function () {
      locals.token = {
        appealId,
        subscriptionId,
      };
      const catchStub = sinon.stub().resolves();
      thenStub.returns({ catch: catchStub });
      validateToken(req, res, next);
      expect(getRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(thenStub).to.have.been.calledOnce;
      expect(catchStub).to.have.been.calledOnce;
    });

    it('should not request when token is null', function () {
      params.mactoken = null;
      validateToken(req, res, next);
      expect(getRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('should updateLocalToken', function () {
      params.mactoken = null;
      validateToken(req, res, next);
      expect(getRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });
});
