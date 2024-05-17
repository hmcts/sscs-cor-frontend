import { CaseService } from 'app/server/services/cases';
import nock from 'nock';
import config from 'config';
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { expect, sinon } from 'test/chai-sinon';
import HttpException from 'app/server/exceptions/HttpException';

const logger: LoggerInstance = Logger.getLogger('services/hearing');

const apiUrl: string = config.get('api.url');

const userToken = 'someUserToken';
const serviceToken = 'someServiceToken';

describe('services/hearing', function () {
  const email = 'test@example.com';
  const path = '/api/continuous-online-hearings';
  let caseService: CaseService = null;
  const session: SessionData = {
    cookie: undefined,
  } as Partial<SessionData> as SessionData;

  const error = new HttpException(INTERNAL_SERVER_ERROR, 'Server Error');
  const req = { session } as Request;
  before(function () {
    caseService = new CaseService(apiUrl);
  });

  describe('#getOnlineHearing', function () {
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(path)
          .query({ email })
          .reply(OK, apiResponseBody)
          .log((message) => logger.info(message));
      });

      it('resolves the promise', function () {
        return expect(caseService.getOnlineHearing(email, req)).to.be.fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response = await caseService.getOnlineHearing(email, req);
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(path)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.getOnlineHearing(email, req)
        ).to.be.rejectedWith(error.message);
      });
    });

    describe('hearing not found', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(path)
          .query({ email })
          .reply(NOT_FOUND);
      });

      it('resolves the promise with 404 status', async function () {
        const response = await caseService.getOnlineHearing(email, req);
        expect(response.statusCode).to.equal(NOT_FOUND);
      });
    });

    describe('multiple hearings found', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(path)
          .query({ email })
          .reply(UNPROCESSABLE_ENTITY);
      });

      it('resolves the promise with 422 status', async function () {
        const response = await caseService.getOnlineHearing(email, req);
        expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY);
      });
    });
  });

  describe('#getCasesForCitizen', function () {
    const tya = 'someTyaNumber';
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
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', function () {
        return expect(caseService.getCasesForCitizen(email, tya, req)).to.be
          .fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response = await caseService.getCasesForCitizen(email, tya, req);
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.getCasesForCitizen(email, tya, req)
        ).to.be.rejectedWith(error.message);
      });
    });
  });

  describe('#assignOnlineHearingsToCitizen', function () {
    const tya = 'someTyaNumber';
    const postcode = 'somePostcode';
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', function () {
      const userToken = 'someUserToken';
      const serviceToken = 'someServiceToken';
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .post(`/api/citizen/${tya}`, { email, postcode })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', function () {
        return expect(
          caseService.assignOnlineHearingsToCitizen(email, tya, postcode, req)
        ).to.be.fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response = await caseService.assignOnlineHearingsToCitizen(
          email,
          tya,
          postcode,
          req
        );
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl, {
          reqheaders: {
            Authorization: `Bearer ${userToken}`,
            ServiceAuthorization: `Bearer ${serviceToken}`,
          },
        })
          .post(`/api/citizen/${tya}`, { email, postcode })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.assignOnlineHearingsToCitizen(email, tya, postcode, req)
        ).to.be.rejectedWith(error.message);
      });
    });
  });
});
