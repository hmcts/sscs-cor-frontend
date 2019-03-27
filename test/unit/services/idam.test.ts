import { IdamService } from 'app/server/services/idam';
import { RequestPromise } from 'app/server/services/request-wrapper';
const { expect, sinon } = require('test/chai-sinon');
import { INTERNAL_SERVER_ERROR, OK, NO_CONTENT } from 'http-status-codes';
const timeout = require('config').get('apiCallTimeout');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('idam.api-url');
const appUser: string = config.get('idam.client.id');
const appSecret = config.get('idam.client.secret');
const appPort = config.get('node.port');

describe('services/idam', () => {
  let idamService;
  before(() => {
    idamService = new IdamService(apiUrl, appPort, appSecret);
  });

  describe('getRedirectUrl', () => {
    it('adds port for localhost', () => {
      const redirectUrl = idamService.getRedirectUrl('http', 'localhost');
      expect(redirectUrl).to.be.eql(`http://localhost:${appPort}/sign-in`);
    });

    it('does not add port for remote host', () => {
      const redirectUrl = idamService.getRedirectUrl('http', 'example.com');
      expect(redirectUrl).to.be.eql('http://example.com/sign-in');
    });
  });

  describe('getRegisterUrl', () => {
    it('adds port for localhost', () => {
      const redirectUrl = idamService.getRegisterUrl('http', 'localhost');
      expect(redirectUrl).to.be.eql(`http://localhost:${appPort}/register`);
    });

    it('does not add port for remote host', () => {
      const redirectUrl = idamService.getRegisterUrl('http', 'example.com');
      expect(redirectUrl).to.be.eql('http://example.com/register');
    });
  });

  describe('getUserDetails', () => {
    const path = '/details';
    const token = 'someToken';

    describe('resolving the promise', () => {
      let apiResponse = { 'email': 'someEmail@example.com' };

      beforeEach(() => {
        nock(apiUrl)
          .matchHeader('Authorization', 'Bearer ' + token)
          .get(path)
          .reply(OK, apiResponse);
      });

      it('resolves with the response', async () => (
        expect(idamService.getUserDetails(token)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .replyWithError(error);
      });

      it('with the error', async () => (
        expect(idamService.getUserDetails(token)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('getToken', () => {
    const path = '/oauth2/token';
    const code = 'someCode';
    const protocol = 'http';
    const host = 'example.com';
    let redirectUrl;
    let requestSpy: sinon.SinonSpy;

    beforeEach(() => {
      requestSpy = sinon.spy(RequestPromise, 'request');
      redirectUrl = encodeURI(idamService.getRedirectUrl(protocol, host));
    });

    afterEach(() => {
      requestSpy.restore();
    });

    describe('resolving the promise', () => {
      let apiResponse = { 'email': 'someEmail@example.com' };

      beforeEach(() => {
        nock(apiUrl)
          .post(path)
          .basicAuth({
            user: 'sscs_cor',
            pass: appSecret
          })
          .reply(OK, apiResponse);
      });

      it('makes correct post request', async () => {
        await idamService.getToken(code, protocol, host);
        expect(requestSpy).to.have.been.calledOnce.calledWith({
          auth: { pass: 'a_secret', user: 'sscs_cor' },
          form: {
            code: 'someCode',
            grant_type: 'authorization_code',
            redirect_uri: 'http://example.com/sign-in'
          },
          json: true,
          uri: 'http://localhost:8082/oauth2/token',
          method: 'POST',
          timeout: timeout
        });
      });

      it('resolves the promise with the response', () => (
        expect(idamService.getToken(code, protocol, host)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .post(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(idamService.getToken(code, protocol, host)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('deleteToken', () => {
    const token: string = 'someToken';
    const path: string = `/session/${token}`;

    describe('resolving the promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .delete(path)
          .basicAuth({
            user: 'sscs-cor',
            pass: appSecret
          })
          .reply(NO_CONTENT);
      });

      it('resolves the promise', () => (
        expect(idamService.deleteToken(token)).to.be.fulfilled
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .delete(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(idamService.deleteToken(token)).to.be.rejectedWith(error)
      ));
    });
  });
});
