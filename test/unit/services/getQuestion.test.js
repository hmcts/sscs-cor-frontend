const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');
console.log('woof');


const apiUrl = config.get('api.url');

describe('getQuestion.js', () => {

  console.log('meow')

  const hearingId = '121';
  const questionId = '62';
  const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

  const apiResponse = {
    question_id: questionId,
    question_header_text: 'What is the meaning of life?'
  };

  it.only('resolves the promise with the response', () => {
    nock(apiUrl)
      .get(path)
      .reply(OK, apiResponse);
    const getQuestionService = require('app/services/getQuestion');

    return expect(getQuestionService(hearingId, questionId)).to.be.fulfilled;
  });

  it('returns error', () => {
    const error = {value: INTERNAL_SERVER_ERROR, reason: ''}
    nock(apiUrl)
      .get(path)
      .replyWithError(error);
  });
  // const question = getQuestionService(hearingId, questionId);
  // expect question to return error


});
