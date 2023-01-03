import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { addUserToCase, getCases } from 'app/server/services/citizenCaseApi';
import { Request } from 'express';
import { Response as fetchResponse } from 'node-fetch';
import config from 'config';
import { SessionData } from 'express-session';
import nock from 'nock';
import { expect } from 'test/chai-sinon';
import HttpException from 'app/server/exceptions/HttpException';

const apiUrl: string = config.get('api.url');

describe('services/citizenCaseApi', function () {
  const session: SessionData = {
    cookie: null,
    accessToken: 'someUserToken',
    serviceToken: 'someServiceToken',
    tya: 'someTyaNumber',
    idamEmail: 'test@example.com',
  };
  const body = {
    postcode: 'somePostcode',
  };
  const req = { session, body } as Request;
  const error = new HttpException(INTERNAL_SERVER_ERROR, 'Server Error');

  describe('#getCases', function () {
    const apiResponseBody = [
      {
        appellant_name: 'Adam Jenkins',
        case_reference: '112233',
        online_hearing_id: 'abc-123-def-456',
      },
    ];

    describe('success response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .get(`/api/citizen/${session.tya}`)
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', function () {
        return expect(getCases(req)).to.be.fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response: fetchResponse = await getCases(req);
        expect(await response.json()).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .get(`/api/citizen/${session.tya}`)
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(getCases(req)).to.be.rejectedWith(error.message);
      });
    });
  });

  describe('#addUserToCase', function () {
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .post(`/api/citizen/${session.tya}`, {
            email: session.idamEmail,
            postcode: body.postcode,
          })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', function () {
        return expect(addUserToCase(req)).to.be.fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response: fetchResponse = await addUserToCase(req);
        expect(await response.json()).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .post(`/api/citizen/${session.tya}`, {
            email: session.idamEmail,
            postcode: body.postcode,
          })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(addUserToCase(req)).to.be.rejectedWith(error.message);
      });
    });
  });
});
