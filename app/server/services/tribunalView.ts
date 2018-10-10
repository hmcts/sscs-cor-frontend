import * as request from 'superagent';
const config = require('config');
const apiUrl = config.get('api.url');

async function recordTribunalViewResponse(hearingId: string, reply: string, reason?: string) {
  try {
    const response: request.Response = await request
      .patch(`${apiUrl}/continuous-online-hearings/${hearingId}/tribunal-view`)
      .send({ reply, reason: reason ? reason : '' });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

export {
  recordTribunalViewResponse
};
