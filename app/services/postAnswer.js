const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

async function postAnswer(hearingId, questionId, answerState, answerText) {
  try {
    const response = await request
      .put(`${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}/answers`)
      .send({
        answer_state: answerState,
        answer_text: answerText
      });
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = postAnswer;
