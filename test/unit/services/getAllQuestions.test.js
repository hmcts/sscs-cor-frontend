const getAllQuestionsService = require('app/services/getAllQuestions');
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/getAllQuestions.js', () => {
  const hearingId = '121';
  const path = `/continuous-online-hearings/${hearingId}`;

  const apiResponse = {
    questions: [
      {
        question_id: '001',
        question_header_text: 'How do you interact with people?',
        answer_state: 'draft'
      }
    ]
  };

  describe('resolving the promise', () => {
    beforeEach(() => {
      nock(apiUrl)
        .get(path)
        .reply(OK, apiResponse);
    });

    it('resolves the promise', () => (
      expect(getAllQuestionsService(hearingId)).to.be.fulfilled
    ));

    it('resolves the promise with the response', () => (
      expect(getAllQuestionsService(hearingId)).to.eventually.eql(apiResponse)
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
      expect(getAllQuestionsService(hearingId)).to.be.rejectedWith(error)
    ));
  });
});
