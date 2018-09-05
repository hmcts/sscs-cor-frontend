const cache = require('memory-cache');
const questionData = require('./questionData');

function getCachedAnswer(questionId) {
  const cachedAnswer = cache.get(`${questionId}.answer`);
  return cachedAnswer ? cachedAnswer : '';
}

module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId/questions/:questionId',
  method: 'GET',
  cache: false,
  template: {
    question_id: params => `${params.questionId}`,
    question_header_text: params => questionData[params.questionId].header,
    question_body_text: params => questionData[params.questionId].body,
    answer: params => getCachedAnswer(params.questionId),
    /* eslint-disable arrow-body-style */
    answer_state: params => {
      return params.questionId === '002' ? 'submitted' : 'draft';
    },
    answer_datetime: params => {
      return params.questionId === '002' ? '2018-09-05T12:40:51Z' : null;
    }
  }
};
