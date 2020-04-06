import * as path from 'path';
import * as fs from 'fs';
import * as appInsights from 'app/server/app-insights';
const {
  changeEmailAddress,
  stopReceivingEmails
} = require('app/server/services/appealService');
const { expect, sinon } = require('test/chai-sinon');
const HttpStatus = require('http-status-codes');
const apiURL = require('config').get('tribunals.api-url');
const nock = require('nock');

describe('appealService.js', () => {
  let req = null;
  let res = null;
  let next = null;
  let notificationsUrl = null;

  beforeEach(() => {
    req = {
      params: {},
      body: { email: 'myemail@email.com' }
    };

    res = {
      locals: {
        appeal: {},
        token: {
          appealId: 'md002',
          subscriptionId: 'qwerty123'
        }
      }
    };

    next = sinon.stub();
    notificationsUrl = `/appeals/${res.locals.token.appealId}/subscriptions/${res.locals.token.subscriptionId}`;
  });

  describe('changeEmailAddress() - POST 200', () => {
    it('should call next() passing zero arguments', () => {
      nock(apiURL)
        .post(notificationsUrl, { subscription: { email: req.body.email } })
        .reply(HttpStatus.OK);

      return changeEmailAddress(req, res, next)
        .then(() => {
          return expect(next).to.have.been.called;
        });
    });
  });

  describe('changeEmailAddress() - POST 500', () => {
    beforeEach(() => {
      sinon.spy(appInsights, 'trackException');
    });
    it('should call next() with the error', () => {
      const error = { value: HttpStatus.INTERNAL_SERVER_ERROR, reason: 'server error' };
      nock(apiURL)
        .post(notificationsUrl, { subscription: { email: req.body.email } })
        .replyWithError(error);

      return changeEmailAddress(req, res, next)
        .then(() => {
          expect(next).to.have.been.calledWith(error);
          expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
        });
    });
  });

  describe('stopReceivingEmails() - DELETE 200', () => {
    it('should call next() passing zero arguments', () => {
      nock(apiURL)
        .delete(notificationsUrl)
        .reply(HttpStatus.OK);

      return stopReceivingEmails(req, res, next)
        .then(() => {
          return expect(next).to.have.been.called;
        });
    });
  });

  describe('stopReceivingEmails() - DELETE 500', () => {
    beforeEach(() => {
      sinon.spy(appInsights, 'trackException');
    });
    it('should call next() passing an error containing a 500', () => {
      const error = { value: HttpStatus.INTERNAL_SERVER_ERROR, reason: 'server error' };
      nock(apiURL)
        .delete(notificationsUrl)
        .replyWithError(error);

      return stopReceivingEmails(req, res, next)
        .then(() => {
          expect(next).to.have.been.calledWith(error);
          expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
        });
    });
  });
});
