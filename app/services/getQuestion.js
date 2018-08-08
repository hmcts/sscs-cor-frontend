const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

function getQuestion(hearingId, questionId) {
  console.log('eggs');
  return request
    .get(`${apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`)
    .then(response => {
      console.log('here');
      return Promise.resolve(response.body);
    })
    .catch(error => {
      console.log('error');
      return Promise.reject(error);
    });
}

module.exports = getQuestion;
