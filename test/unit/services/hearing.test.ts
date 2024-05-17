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
        nock(apiUrl)
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
        nock(apiUrl)
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
        nock(apiUrl)
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
