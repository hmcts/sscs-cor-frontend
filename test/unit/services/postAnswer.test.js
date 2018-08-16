const postAnswerService = require('app/services/postAnswer');
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/postAnswer.js', () => {
  const hearingId = '121';
  const questionId = '62';
  /* eslint-disable camelcase */
  const answer_state = 'answer_drafted';
  const answer = 'My answer';
  /* eslint-enable camelcase */
  const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}/answers`;

  const apiResponse = {
    answer_id: '001'
  };

  describe('resolving the promise', () => {
    beforeEach(() => {
      nock(apiUrl)
        .put(path, {
          answer_state,
          answer
        })
        .reply(OK, apiResponse);
    });

    it('resolves the promise', () => (
      expect(postAnswerService(hearingId, questionId, answer_state, answer)).to.be.fulfilled
    ));

    it('resolves the promise with the response', () => (
      expect(postAnswerService(hearingId, questionId, answer_state, answer))
        .to.eventually.eql(apiResponse)
    ));
  });

  describe('rejecting the promise', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .put(path, {
          answer_state,
          answer
        })
        .replyWithError(error);
    });

    it('rejects the promise with the error', () => (
      expect(postAnswerService(hearingId, questionId, answer_state, answer))
        .to.be.rejectedWith(error)
    ));
  });
});
