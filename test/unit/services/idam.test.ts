import { IdamService } from 'app/server/services/idam';
import { RequestPromise } from 'app/server/services/request-wrapper';
import { INTERNAL_SERVER_ERROR, OK, NO_CONTENT } from 'http-status-codes';
import { SinonSpy } from 'sinon';
import { expect, sinon } from 'test/chai-sinon';
import config from 'config';
import nock from 'nock';
import HttpException from 'app/server/exceptions/HttpException';

const timeout = config.get('apiCallTimeout');
const apiUrl: string = config.get('idam.api-url');
const appUser: string = config.get('idam.client.id');
const appSecret: string = config.get('idam.client.secret');
const appPort: number = config.get('node.port');

describe('services/idam', function () {
  const error = new HttpException(INTERNAL_SERVER_ERROR, 'Server Error');
  let idamService: IdamService;

  before(function () {
    idamService = new IdamService(apiUrl, appPort, appSecret);
  });

  describe('getRedirectUrl', function () {
    it('adds port for localhost', function () {
      const redirectUrl = idamService.getRedirectUrl('http', 'localhost');
      expect(redirectUrl).to.be.eql(`http://localhost:${appPort}/sign-in`);
    });

    it('does not add port for remote host', function () {
      const redirectUrl = idamService.getRedirectUrl('http', 'example.com');
      expect(redirectUrl).to.be.eql('http://example.com/sign-in');
    });
  });

  describe('getRegisterUrl', function () {
    it('adds port for localhost', function () {
      const redirectUrl = idamService.getRegisterUrl('http', 'localhost');
      expect(redirectUrl).to.be.eql(`http://localhost:${appPort}/register`);
    });

    it('does not add port for remote host', function () {
      const redirectUrl = idamService.getRegisterUrl('http', 'example.com');
      expect(redirectUrl).to.be.eql('http://example.com/register');
    });
  });

  describe('getUserDetails', function () {
    const path = '/details';
    const token = 'someToken';

    describe('resolving the promise', function () {
      const apiResponse = { email: 'someEmail@example.com' };

      beforeEach(function () {
        nock(apiUrl)
          .matchHeader('Authorization', `Bearer ${token}`)
          .get(path)
          .reply(OK, apiResponse);
      });

      it('resolves with the response', async function () {
        return expect(idamService.getUserDetails(token)).to.eventually.eql(
          apiResponse
        );
      });
    });

    describe('rejecting the promise', function () {
      beforeEach(function () {
        nock(apiUrl).get(path).replyWithError(error);
      });

      it('with the error', async function () {
        return expect(idamService.getUserDetails(token)).to.be.rejectedWith(
          error.message
        );
      });
    });
  });

  describe('getToken', function () {
    const path = '/oauth2/token';
    const code = 'someCode';
    const protocol = 'http';
    const host = 'example.com';
    let redirectUrl;
    let requestSpy: SinonSpy;

    beforeEach(function () {
      requestSpy = sinon.spy(RequestPromise, 'request');
      redirectUrl = encodeURI(idamService.getRedirectUrl(protocol, host));
    });

    afterEach(function () {
      requestSpy.restore();
    });

    describe('resolving the promise', function () {
      const apiResponse = { email: 'someEmail@example.com' };

      beforeEach(function () {
        nock(apiUrl)
          .post(path)
          .basicAuth({
            user: 'sscs',
            pass: appSecret,
          })
          .reply(OK, apiResponse);
      });

      it.skip('makes correct post request', async function () {
        await idamService.getToken(code, protocol, host);
        expect(requestSpy).to.have.been.calledOnce.calledWith({
          auth: { pass: 'QM5RQQ53LZFOSIXJ', user: 'sscs' },
          form: {
            code: 'someCode',
            grant_type: 'authorization_code',
            redirect_uri: 'http://example.com/sign-in',
          },
          json: true,
          uri: 'http://localhost:8082/oauth2/token',
          method: 'POST',
          timeout,
        });
      });

      it('resolves the promise with the response', function () {
        return expect(
          idamService.getToken(code, protocol, host)
        ).to.eventually.eql(apiResponse);
      });
    });

    describe('rejecting the promise', function () {
      beforeEach(function () {
        nock(apiUrl).post(path).replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          idamService.getToken(code, protocol, host)
        ).to.be.rejectedWith(error.message);
      });
    });
  });

  describe('deleteToken', function () {
    const token = 'someToken';
    const path = `/session/${token}`;

    describe('resolving the promise', function () {
      beforeEach(function () {
        nock(apiUrl)
          .delete(path)
          .basicAuth({
            user: 'sscs',
            pass: appSecret,
          })
          .reply(NO_CONTENT);
      });

      it('resolves the promise', function () {
        return expect(idamService.deleteToken(token)).to.be.fulfilled;
      });
    });

    describe('rejecting the promise', function () {
      beforeEach(function () {
        nock(apiUrl).delete(path).replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(idamService.deleteToken(token)).to.be.rejectedWith(
          error.message
        );
      });
    });
  });
});
