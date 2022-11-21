import { CaseService } from '../../../app/server/services/cases';
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNPROCESSABLE_ENTITY,
} from 'http-status-codes';

const { expect } = require('test/chai-sinon');

const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/hearing', function () {
  const email = 'test@example.com';
  const path = '/api/continuous-online-hearings';
  let caseService: CaseService = null;
  const req: any = {};
  before(function () {
    caseService = new CaseService(apiUrl);
    req.session = {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    };
  });

  describe('#getOnlineHearing', function () {
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
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
        })
          .get(path)
          .query({ email })
          .reply(OK, apiResponseBody);
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
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(function () {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(path)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.getOnlineHearing(email, req)
        ).to.be.rejectedWith(error);
      });
    });

    describe('hearing not found', function () {
      beforeEach(function () {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
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
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
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
      const userToken = 'someUserToken';
      const serviceToken = 'someServiceToken';
      beforeEach(function () {
        nock(apiUrl, {
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
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
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(function () {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.getCasesForCitizen(email, tya, req)
        ).to.be.rejectedWith(error);
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
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
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
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(function () {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .post(`/api/citizen/${tya}`, { email, postcode })
          .replyWithError(error);
      });

      it('rejects the promise with the error', function () {
        return expect(
          caseService.assignOnlineHearingsToCitizen(email, tya, postcode, req)
        ).to.be.rejectedWith(error);
      });
    });
  });
});
