const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

function getQuestion(hearingId, questionId) {
  return request
    .get(`${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`)
    .then(response => Promise.resolve(response.body))
    .catch(error => Promise.reject(error));
}

module.exports = getQuestion;
