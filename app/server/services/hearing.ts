import * as request from 'superagent';
const config = require('config');
const apiUrl = config.get('api.url');

async function get(hearingId: string) {
  try {
    const response: request.Response = await request
      .get(`${apiUrl}/continuous-online-hearings/${hearingId}`);
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function updateDeadline(hearingId: string) {
  try {
    const response: request.Response = await request
      .patch(`${apiUrl}/continuous-online-hearings/${hearingId}`)
      .send();
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

export {
  get,
  updateDeadline
}