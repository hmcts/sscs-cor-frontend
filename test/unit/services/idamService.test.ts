import { getRedirectUrl, getToken, deleteToken, getUserDetails } from 'app/server/services/idamService';
const { expect } = require('test/chai-sinon');
import { INTERNAL_SERVER_ERROR, OK, NO_CONTENT } from 'http-status-codes';

const nock = require('nock');
const config = require('config');

const apiUrl = config.get('idam.api-url');
const appSecret = config.get('idam.client.secret');
const appPort = config.get('node.port');

describe('services/idamService', () => {
  describe('getRedirectUrl', () => {
    it('adds port for localhost', () => {
      const redirectUrl = getRedirectUrl('http', 'localhost');
      expect(redirectUrl).to.be.eql(`http://localhost:${appPort}/sign-in`);
    });

    it('does not add port for remote host', () => {
      const redirectUrl = getRedirectUrl('http', 'example.com');
      expect(redirectUrl).to.be.eql('http://example.com/sign-in');
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

      it('resolves the promise', () => (
        expect(getUserDetails(token)).to.be.fulfilled
      ));

      it('resolves the promise with the response', () => (
        expect(getUserDetails(token)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(getUserDetails(token)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('getToken', () => {
    const path = '/oauth2/token';
    const code = 'someCode';
    const protocol = 'http';
    const host = 'example.com';

    describe('resolving the promise', () => {
      let apiResponse = { 'email': 'someEmail@example.com' };

      beforeEach(() => {
        nock(apiUrl)
          .post(path, 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + encodeURIComponent(getRedirectUrl(protocol, host)))
          .basicAuth({
            user: 'sscs-cor',
            pass: appSecret
          })
          .reply(OK, apiResponse);
      });

      it('resolves the promise', () => (
        expect(getToken(code, protocol, host)).to.be.fulfilled
      ));

      it('resolves the promise with the response', () => (
        expect(getToken(code, protocol, host)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .post(path, 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + encodeURIComponent(getRedirectUrl(protocol, host)))
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(getToken(code, protocol, host)).to.be.rejectedWith(error)
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
        expect(deleteToken(token)).to.be.fulfilled
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
        expect(deleteToken(token)).to.be.rejectedWith(error)
      ));
    });
  });
});
