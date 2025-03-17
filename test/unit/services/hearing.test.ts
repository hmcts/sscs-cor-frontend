import { CaseService } from 'app/server/services/cases';
import nock from 'nock';
import config from 'config';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { expect } from 'test/chai-sinon';
import HttpException from 'app/server/exceptions/HttpException';
import { StatusCodes } from 'http-status-codes';

const apiUrl: string = config.get('tribunals-api.url');
const error = new HttpException(
  StatusCodes.INTERNAL_SERVER_ERROR,
  'Server Error'
);

describe('services/hearing', function () {
  const email = 'test@example.com';
  let caseService: CaseService = null;
  const session: SessionData = {
    cookie: undefined,
  } as Partial<SessionData> as SessionData;
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
          .reply(StatusCodes.OK, apiResponseBody);
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
        nock(apiUrl)
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .reply(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error');
      });

      it('rejects the promise with the error', async function () {
        const response = await caseService.getCasesForCitizen(email, tya, req);
        expect(response.body).to.deep.equal('Server Error');
      });
    });
  });

  describe('#assignOnlineHearingsToCitizen', function () {
    const tya = 'someTyaNumber';
    const postcode = 'somePostcode';
    const ibcaReference = 'ibcaReference';
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', function () {
      beforeEach(function () {
        nock(apiUrl)
          .post(`/api/citizen/${tya}`, { email, postcode, ibcaReference })
          .reply(StatusCodes.OK, apiResponseBody);
      });

      it('resolves the promise', function () {
        return expect(
          caseService.assignOnlineHearingsToCitizen(
            email,
            tya,
            postcode,
            ibcaReference,
            req
          )
        ).to.be.fulfilled;
      });

      it('resolves the promise with the response', async function () {
        const response = await caseService.assignOnlineHearingsToCitizen(
          email,
          tya,
          postcode,
          ibcaReference,
          req
        );
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', function () {
      beforeEach(function () {
        nock(apiUrl)
          .post(`/api/citizen/${tya}`, { email, postcode, ibcaReference })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.assignOnlineHearingsToCitizen(
            email,
            tya,
            postcode,
            ibcaReference,
            req
          )
        ).to.be.rejectedWith(error.message);
      });
    });
  });
});
