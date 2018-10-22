import { extendDeadline } from 'app/server/services/extend-deadline';
import * as moment from 'moment';

const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/extend-deadline.ts', () => {
  const hearingId = '121';
  const path = `/continuous-online-hearings/${hearingId}`;

  const apiResponse = {
    deadline_expiry_date: moment.utc().add(14, 'day').format()
  };

  describe('Update hearing deadline', () => {
    beforeEach(() => {
      nock(apiUrl)
        .patch(path)
        .reply(OK, apiResponse);
    });
    it('resolves the promise with the response', async () => (
      expect(extendDeadline(hearingId)).to.eventually.eql(apiResponse)
    ));
  });

  describe('rejecting the promises', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    before(() => {
      nock(apiUrl)
        .get(path)
        .replyWithError(error);
    });

    after(() => {
      nock.cleanAll();
    });

    it('rejects updateDeadline with the error', () => (
      expect(extendDeadline(hearingId)).to.be.rejectedWith(error)
    ));
  });
});

export {};
