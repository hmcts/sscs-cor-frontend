import { recordTribunalViewResponse } from 'app/server/services/tribunalView';

const { expect } = require('test/chai-sinon');
const { NO_CONTENT, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const apiUrl = require('config').get('api.url');

describe('services/tribunalView', () => {
  const hearingId = '121';
  const path = `/continuous-online-hearings/${hearingId}/tribunal-view`;

  describe('recordTribunalViewResponse', () => {
    describe('on success', () => {
      beforeEach(() => {
        nock(apiUrl)
          .patch(path)
          .reply(NO_CONTENT);
      });
      it('resolves the promise', async () => (
        expect(recordTribunalViewResponse(hearingId, 'decision_accepted')).to.eventually.be.fulfilled
      ));
    });
    describe('on failure', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .replyWithError(error);
      });
      it('rejects updateDeadline with the error', () => (
        expect(recordTribunalViewResponse(hearingId, 'decision_accepted')).to.be.rejectedWith(error)
      ));
    });
  });
});

export {};