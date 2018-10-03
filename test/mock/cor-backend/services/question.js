const cache = require('memory-cache');
const questionData = require('./questionData');

function getCachedAnswer(questionId) {
  const cachedAnswer = cache.get(`${questionId}.answer`);
  return cachedAnswer ? cachedAnswer : '';
}

function getCachedState(questionId) {
  const cachedState = cache.get(`${questionId}.state`);
  return cachedState ? cachedState : '';
}

function getCachedDate(questionId) {
  const cachedDate = cache.get(`${questionId}.answer_date`);
  return cachedDate ? cachedDate : null;
}

module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId/questions/:questionId',
  method: 'GET',
  cache: false,
  template: {
    question_id: params => `${params.questionId}`,
    question_ordinal: params => parseInt(params.questionId.replace('00', ''), 10),
    question_header_text: params => questionData[params.questionId].header,
    question_body_text: params => questionData[params.questionId].body,
    answer: params => getCachedAnswer(params.questionId),
    answer_state: params => getCachedState(params.questionId),
    answer_date: params => getCachedDate(params.questionId)
  }
};
