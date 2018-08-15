const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

async function getQuestion(hearingId) {
  try {
    const response = await request
      .get(`${apiUrl}/continuous-online-hearings/${hearingId}/questions`);
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = getQuestion;
