const getOnlineHearingService = require('app/services/getOnlineHearing');
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR, NOT_FOUND } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/getOnlineHearing.js', () => {
  const email = 'test@example.com';
  const path = '/continuous-online-hearings';

  const apiResponse = {
    appellant_name: 'Adam Jenkins',
    case_reference: 'SC/112/233',
    online_hearing_id: 'abc-123-def-456'
  };

  describe('success response', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .reply(OK, apiResponse);
    });

    it('resolves the promise', () => (
      expect(getOnlineHearingService(email)).to.be.fulfilled
    ));

    it('resolves the promise with the response', () => (
      expect(getOnlineHearingService(email)).to.eventually.eql(apiResponse)
    ));
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
      expect(getOnlineHearingService(email)).to.be.rejectedWith(error)
    ));
  });

  describe('hearing not found', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .query({ email })
        .reply(NOT_FOUND);
    });

    it('rejects the promise', () => (
      expect(getOnlineHearingService(email)).to.be.rejectedWith('Not Found')
    ));
  });
});
