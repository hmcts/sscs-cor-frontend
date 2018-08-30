const { saveAnswer: saveAnswerService, submitAnswer: submitAnswerService } = require('app/services/updateAnswer');
const { expect } = require('test/chai-sinon');
const { NO_CONTENT, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/updateAnswer.js', () => {
  const hearingId = '121';
  const questionId = '62';
  /* eslint-disable camelcase */
  const answer_state = 'draft';
  const answer = 'My answer';
  /* eslint-enable camelcase */
  const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

  const apiResponse = {
    answer_id: '001'
  };

  describe('resolving the save answer promise', () => {
    beforeEach(() => {
      nock(apiUrl)
        .put(path, {
          answer_state,
          answer
        })
        .reply(NO_CONTENT, apiResponse);
    });

    it('resolves the save answer promise', () => (
      expect(saveAnswerService(hearingId, questionId, answer_state, answer)).to.be.fulfilled
    ));

    it('resolves the save answer promise with the response', () => (
      expect(saveAnswerService(hearingId, questionId, answer_state, answer))
        .to.eventually.eql(apiResponse)
    ));
  });

  describe('resolving the submit answer promise', () => {
    beforeEach(() => {
      nock(apiUrl)
        .post(path)
        .reply(NO_CONTENT, apiResponse);
    });

    it('resolves the submit answer promise', () => (
      expect(submitAnswerService(hearingId, questionId)).to.be.fulfilled
    ));

    it('resolves the submit answer promise with the response', () => (
      expect(submitAnswerService(hearingId, questionId))
        .to.eventually.eql(apiResponse)
    ));
  });

  describe('rejecting the save answer promise', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .put(path, {
          answer_state,
          answer
        })
        .replyWithError(error);
    });

    it('rejects the save answer promise with the error', () => (
      expect(saveAnswerService(hearingId, questionId, answer_state, answer))
        .to.be.rejectedWith(error)
    ));
  });

  describe('rejecting the submit answer promise', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .post(path)
        .replyWithError(error);
    });

    it('rejects the submit answer promise with the error', () => (
      expect(submitAnswerService(hearingId, questionId))
        .to.be.rejectedWith(error)
    ));
  });
});
