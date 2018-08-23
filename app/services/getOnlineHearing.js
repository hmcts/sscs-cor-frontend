const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

async function getOnlineHearing(email) {
  try {
    const response = await request
      .get(`${apiUrl}/continuous-online-hearings`)
      .query({ email });
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = getOnlineHearing;
