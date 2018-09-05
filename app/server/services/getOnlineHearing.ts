const config = require('config');
const request = require('superagent');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');

const apiUrl = config.get('api.url');

async function getOnlineHearing(email) {
  try {
    const response = await request
      .get(`${apiUrl}/continuous-online-hearings`)
      .query({ email })
      .ok(res => res.status < INTERNAL_SERVER_ERROR);
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

export = getOnlineHearing;
