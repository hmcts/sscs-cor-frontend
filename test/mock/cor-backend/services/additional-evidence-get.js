const cache = require('memory-cache');

function getCachedEvidence(hearingId) {
  const cachedEvidence = cache.get(`${hearingId}.evidence`);
  return cachedEvidence ? cachedEvidence : [];
}

module.exports = {
  path: '/api/continuous-online-hearings/:onlineHearingId/evidence',
  method: 'GET',
  cache: false,
  template: params => getCachedEvidence(params.onlineHearingId)
};
