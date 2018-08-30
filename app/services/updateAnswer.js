const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');


function buildAnswerUrl(hearingId, questionId) {
  return `${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`;
}

async function saveAnswer(hearingId, questionId, answerState, answerText) {
  try {
    const response = await request
      .put(buildAnswerUrl(hearingId, questionId))
      .send({
        answer_state: answerState,
        answer: answerText
      });
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function submitAnswer(hearingId, questionId) {
  try {
    const response = await request
      .post(buildAnswerUrl(hearingId, questionId))
      .set('Content-Length', '0')
      .send();
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = {
  saveAnswer,
  submitAnswer
};
