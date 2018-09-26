import { getOnlineHearing } from 'app/server/services/getOnlineHearing';
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/getOnlineHearing.js', () => {
  const email = 'test@example.com';
  const path = '/continuous-online-hearings';

  const apiResponseBody = {
    appellant_name: 'Adam Jenkins',
    case_reference: 'SC/112/233',
    online_hearing_id: 'abc-123-def-456'
  };

  describe('success response', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .reply(OK, apiResponseBody);
    });

    it('resolves the promise', () => (
      expect(getOnlineHearing(email)).to.be.fulfilled
    ));

    it('resolves the promise with the response', async() => {
      const response = await getOnlineHearing(email);
      expect(response.body).to.deep.equal(apiResponseBody);
    });
  });

  describe('error response', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .replyWithError(error);
    });

    it('rejects the promise with the error', () => (
      expect(getOnlineHearing(email)).to.be.rejectedWith(error)
    ));
  });

  describe('hearing not found', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .reply(NOT_FOUND);
    });

    it('resolves the promise with 404 status', async() => {
      const response = await getOnlineHearing(email);
      expect(response.status).to.equal(NOT_FOUND);
    });
  });

  describe('multiple hearings found', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .reply(UNPROCESSABLE_ENTITY);
    });

    it('resolves the promise with 422 status', async() => {
      const response = await getOnlineHearing(email);
      expect(response.status).to.equal(UNPROCESSABLE_ENTITY);
    });
  });
});

export {};