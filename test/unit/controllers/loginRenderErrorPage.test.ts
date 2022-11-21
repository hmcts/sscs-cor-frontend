import { IdamService } from 'app/server/services/idam';

import { renderErrorPage } from 'app/server/controllers/login';
import { NextFunction, Request, Response } from 'express';
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';
import { Session, SessionData } from 'express-session';
import { expect, sinon } from 'test/chai-sinon';

const i18next = require('i18next');

describe('controllers/login renderErrorPage', function () {
  let req: Request = null;
  const res: Response = {} as Response;
  let next: NextFunction = null;
  const session: Session = {
    cookie: undefined,
    language: 'en',
  } as SessionData as Session;

  const appPort = 123;
  const idamService: IdamService = new IdamService(
    'test.com',
    appPort,
    'testsecret'
  );

  const body = 'this is a test error';

  beforeEach(function () {
    req = {
      session,
      query: { redirectUrl: '', tya: 'tya-number' },
      cookies: {},
      protocol: 'http',
      hostname: 'localhost',
    } as Partial<Request> as Request;
    res.render = sinon.stub();
    next = sinon.stub().resolves();
  });

  it('NOT_FOUND', function () {
    i18next.language = 'en';
    renderErrorPage('email@email.com', NOT_FOUND, body, idamService, req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk', {
      header: 'There is no benefit appeal associated with this email address',
      messages: [
        'Either you have changed your email address or you do not have an active benefit appeal.',
        'If you have changed your email address then you need to create a new account using your new email address:',
        "<a class='govuk-link' href='http://localhost:123/register'>http://localhost:123/register</a>'",
      ],
    });
  });

  it('UNPROCESSABLE_ENTITY', function () {
    i18next.language = 'en';
    renderErrorPage(
      'email@email.com',
      UNPROCESSABLE_ENTITY,
      body,
      idamService,
      req,
      res
    );
    expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk', {
      header: 'There is a technical problem with your account',
      messages: [
        'There is a technical problem with the account you are using to access your benefit appeal.',
        'Please email <a href="mailto:{{ i18n.contactEmail }}">{{ i18n.contactEmail }}</a> and we will resolve it for you. Include your appeal reference number and name.',
        'We apologise for any inconvenience.',
      ],
    });
  });

  it('CONFLICT', function () {
    i18next.language = 'en';
    renderErrorPage('email@email.com', CONFLICT, body, idamService, req, res);
    expect(res.render).to.have.been.calledOnce.calledWith('errors/error.njk', {
      header: 'You cannot access this service',
      messages: [
        'Please check any emails or letters you have received about your benefit appeal if you would like an update.',
      ],
    });
  });

  it('other error', function () {
    i18next.language = 'en';

    expect(function () {
      renderErrorPage(
        'email@email.com',
        INTERNAL_SERVER_ERROR,
        body,
        idamService,
        req,
        res
      );
    }).to.throw(body);
  });
});
