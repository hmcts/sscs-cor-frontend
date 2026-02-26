import config from 'config';
import {
  changeEmailAddress,
  stopReceivingEmails,
} from 'app/server/services/unsubscribeService';
import { expect, sinon } from 'test/chai-sinon';
import { Request, Response, NextFunction } from 'express';
import { SessionData } from 'express-session';

import superagent, { SuperAgentRequest } from 'superagent';
import { SinonStub } from 'sinon';
import { after } from 'mocha';

const apiUrl: string = config.get('tribunals-api.url');

describe('services/unsubscribeService', function () {
  const session: SessionData = {
    accessToken: 'someUserToken',
    serviceToken: 'someServiceToken',
  } as Partial<SessionData> as SessionData;
  const body = {
    email: 'test@test.com',
  };
  const req = {
    session,
    body,
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
  let postRequest: SinonStub;
  let deleteRequest: SinonStub;
  let sendStub: SinonStub;
  let thenStub: SinonStub;

  before(function () {
    thenStub = sinon.stub();
    sendStub = sinon.stub().returns({
      then: thenStub,
    });
    postRequest = sinon.stub(superagent, 'post').returns({
      send: sendStub,
    } as unknown as SuperAgentRequest);
    deleteRequest = sinon.stub(superagent, 'delete').returns({
      then: thenStub,
    } as unknown as SuperAgentRequest);
    next = sinon.stub().resolves();
  });

  after(function () {
    sinon.reset();
  });

  describe('changeEmailAddress', function () {
    const endpoint = `${apiUrl}/appeals/${appealId}/subscriptions/${subscriptionId}`;

    beforeEach(function () {
      thenStub.resolves(Promise<void>);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    it('should changeEmailAddress', function () {
      locals.token = {
        appealId,
        subscriptionId,
      };
      changeEmailAddress(req, res, next);

      expect(postRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(sendStub).to.have.been.calledOnce.calledWith({
        subscription: { email: body.email },
      });
      expect(thenStub).to.have.been.calledOnce;
    });

    it('should catch on request error', function () {
      locals.token = {
        appealId,
        subscriptionId,
      };
      const catchStub = sinon.stub().resolves();
      thenStub.returns({ catch: catchStub });
      changeEmailAddress(req, res, next);
      expect(postRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(sendStub).to.have.been.calledOnce.calledWith({
        subscription: { email: body.email },
      });
      expect(thenStub).to.have.been.calledOnce;
      expect(catchStub).to.have.been.calledOnce;
    });

    it('should not request when token is null', function () {
      locals.token = null;
      changeEmailAddress(req, res, next);
      expect(postRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('should not request when appealId is null', function () {
      locals.token = {
        subscriptionId,
      };
      changeEmailAddress(req, res, next);
      expect(postRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('should not request when subscriptionId is null', function () {
      locals.token = {
        appealId,
      };
      changeEmailAddress(req, res, next);
      expect(postRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });

  describe('stopReceivingEmails', function () {
    const endpoint = `${apiUrl}/appeals/${appealId}/subscriptions/${subscriptionId}`;

    beforeEach(function () {
      thenStub.resolves(Promise<void>);
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    it('should stopReceivingEmails', function () {
      locals.token = {
        appealId,
        subscriptionId,
      };
      stopReceivingEmails(req, res, next);
      expect(deleteRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(thenStub).to.have.been.calledOnce;
    });

    it('should catch on request error', function () {
      locals.token = {
        appealId,
        subscriptionId,
      };
      const catchStub = sinon.stub().resolves();
      thenStub.returns({ catch: catchStub });
      stopReceivingEmails(req, res, next);
      expect(deleteRequest).to.have.been.calledOnce.calledWith(endpoint);
      expect(thenStub).to.have.been.calledOnce;
      expect(catchStub).to.have.been.calledOnce;
    });

    it('should not request when token is null', function () {
      locals.token = null;
      stopReceivingEmails(req, res, next);
      expect(deleteRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('should not request when appealId is null', function () {
      locals.token = {
        subscriptionId,
      };
      stopReceivingEmails(req, res, next);
      expect(deleteRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });

    it('should not request when subscriptionId is null', function () {
      locals.token = {
        appealId,
      };
      stopReceivingEmails(req, res, next);
      expect(deleteRequest).to.not.have.been.called;
      expect(next).to.have.been.calledOnce;
    });
  });
});
