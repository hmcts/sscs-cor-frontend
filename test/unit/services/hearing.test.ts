import { HearingService } from 'app/server/services/hearing';
import * as moment from 'moment';
const { expect } = require('test/chai-sinon');
const {
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  NO_CONTENT,
} = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/hearing', () => {
  const email = 'test@example.com';
  const path = '/api/continuous-online-hearings';
  let hearingService;
  const req: any = {};
  before(() => {
    hearingService = new HearingService(apiUrl);
    req.session = {
      accessToken: 'someUserToken',
      serviceToken: 'someServiceToken',
    };
  });

  describe('#getOnlineHearing', () => {
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', () => {
      const userToken = 'someUserToken';
      const serviceToken = 'someServiceToken';
      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
        })
          .get(path)
          .query({ email })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', () =>
        expect(hearingService.getOnlineHearing(email, req)).to.be.fulfilled);

      it('resolves the promise with the response', async () => {
        const response = await hearingService.getOnlineHearing(email, req);
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(path)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', () =>
        expect(hearingService.getOnlineHearing(email, req)).to.be.rejectedWith(
          error
        ));
    });

    describe('hearing not found', () => {
      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(path)
          .query({ email })
          .reply(NOT_FOUND);
      });

      it('resolves the promise with 404 status', async () => {
        const response = await hearingService.getOnlineHearing(email, req);
        expect(response.statusCode).to.equal(NOT_FOUND);
      });
    });

    describe('multiple hearings found', () => {
      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(path)
          .query({ email })
          .reply(UNPROCESSABLE_ENTITY);
      });

      it('resolves the promise with 422 status', async () => {
        const response = await hearingService.getOnlineHearing(email, req);
        expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY);
      });
    });
  });

  describe('#getOnlineHearingsForCitizen', () => {
    const tya = 'someTyaNumber';
    const apiResponseBody = [
      {
        appellant_name: 'Adam Jenkins',
        case_reference: '112233',
        online_hearing_id: 'abc-123-def-456',
      },
    ];

    describe('success response', () => {
      const userToken = 'someUserToken';
      const serviceToken = 'someServiceToken';
      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
        })
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', () =>
        expect(hearingService.getOnlineHearingsForCitizen(email, tya, req)).to
          .be.fulfilled);

      it('resolves the promise with the response', async () => {
        const response = await hearingService.getOnlineHearingsForCitizen(
          email,
          tya,
          req
        );
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .get(`/api/citizen/${tya}`)
          .query({ email })
          .replyWithError(error);
      });

      it('rejects the promise with the error', () =>
        expect(
          hearingService.getOnlineHearingsForCitizen(email, tya, req)
        ).to.be.rejectedWith(error));
    });
  });

  describe('#assignOnlineHearingsToCitizen', () => {
    const tya = 'someTyaNumber';
    const postcode = 'somePostcode';
    const apiResponseBody = {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      online_hearing_id: 'abc-123-def-456',
    };

    describe('success response', () => {
      const userToken = 'someUserToken';
      const serviceToken = 'someServiceToken';
      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${userToken}`,
          ServiceAuthorization: `Bearer ${serviceToken}`,
        })
          .post(`/api/citizen/${tya}`, { email, postcode })
          .reply(OK, apiResponseBody);
      });

      it('resolves the promise', () =>
        expect(
          hearingService.assignOnlineHearingsToCitizen(
            email,
            tya,
            postcode,
            req
          )
        ).to.be.fulfilled);

      it('resolves the promise with the response', async () => {
        const response = await hearingService.assignOnlineHearingsToCitizen(
          email,
          tya,
          postcode,
          req
        );
        expect(response.body).to.deep.equal(apiResponseBody);
      });
    });

    describe('error response', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl, {
          Authorization: `Bearer ${req.session.accessToken}`,
          ServiceAuthorization: `Bearer ${req.session.serviceToken}`,
        })
          .post(`/api/citizen/${tya}`, { email, postcode })
          .replyWithError(error);
      });

      it('rejects the promise with the error', () =>
        expect(
          hearingService.assignOnlineHearingsToCitizen(
            email,
            tya,
            postcode,
            req
          )
        ).to.be.rejectedWith(error));
    });
  });
});
