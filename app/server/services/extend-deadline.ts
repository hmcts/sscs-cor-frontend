import * as request from 'superagent';
const config = require('config');
const apiUrl = config.get('api.url');

async function extendDeadline(hearingId: string) {
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
  extendDeadline
}