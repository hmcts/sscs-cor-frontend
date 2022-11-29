import { validateEmail } from 'app/server/controllers/validateEmail';
import { SessionData } from 'express-session';
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { BAD_REQUEST } from 'http-status-codes';
import { expect, sinon } from 'test/chai-sinon';

describe('controllers/validateEmail', function () {
  const session: SessionData = {
    accessToken: 'someUserToken',
    serviceToken: 'someServiceToken',
  } as Partial<SessionData> as SessionData;
  const email = 'test@test.com';
  const body = {
    email,
    confirmEmail: email,
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
  const res = {} as Response;
  let next: NextFunction = null;

  before(function () {
    res.render = sinon.stub().resolves();
    res.status = sinon.stub().resolves();
    next = sinon.stub().resolves();
  });

  after(function () {
    sinon.reset();
  });

  describe('validateEmail', function () {
    afterEach(function () {
      sinon.resetHistory();
    });

    it('should validate successfully', function () {
      body.email = email;
      body.confirmEmail = email;
      validateEmail(req, res, next);
      expect(next).to.have.been.calledOnce;
    });

    it('should render page with error if mismatching emails', function () {
      body.email = email;
      body.confirmEmail = 'testWrong@test.com';
      validateEmail(req, res, next);
      expect(res.status).to.have.been.calledOnceWith(BAD_REQUEST);

      const fields = {
        error: true,
        email: {
          value: 'test@test.com',
          error: true,
          errorHeading: 'Email addresses do not match',
          errorMessage:
            'Your email addresses don’t match. Check and enter them again.',
        },
        confirmEmail: {
          value: 'testWrong@test.com',
          error: true,
          errorMessage:
            'Your email addresses don’t match. Check and enter them again.',
        },
      };
      expect(res.render).to.have.been.calledOnceWith(
        'email-address-change.njk',
        { mactoken, fields }
      );
    });

    it('should render page with error if invalid email format', function () {
      body.email = 'testWrong';
      body.confirmEmail = 'testWrong';
      validateEmail(req, res, next);
      expect(res.status).to.have.been.calledOnceWith(BAD_REQUEST);

      const fields = {
        error: true,
        email: {
          value: 'testWrong',
          error: true,
          errorHeading: 'New email address is invalid',
          errorMessage:
            'The email address you’ve entered is invalid. Check it and enter it again.',
        },
        confirmEmail: {
          value: 'testWrong',
          error: true,
          errorMessage:
            'The email address you’ve entered is invalid. Check it and enter it again.',
          errorHeading: 'New email address is invalid',
        },
      };
      expect(res.render).to.have.been.calledOnceWith(
        'email-address-change.njk',
        { mactoken, fields }
      );
    });
  });
});
