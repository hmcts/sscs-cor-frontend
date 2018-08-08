const getQuestionService = require('app/services/getQuestion');
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('getQuestion.js', () => {
  const hearingId = '121';
  const questionId = '62';
  const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

  const apiResponse = {
    question_id: questionId,
    question_header_text: 'What is the meaning of life?'
  };

  describe('resolving the promise', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .reply(OK, apiResponse);
    });

    it('resolves the promise', () => (
      expect(getQuestionService(hearingId, questionId)).to.be.fulfilled
    ));

    it('resolves the promise with the response', () => (
      expect(getQuestionService(hearingId, questionId)).to.eventually.eql(apiResponse)
    ));
  });

  describe('rejecting the promise', () => {
    const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .replyWithError(error);
    });

    it('rejects the promise with the error', () => (
      expect(getQuestionService(hearingId, questionId)).to.be.rejectedWith(error)
    ));
  });
});
