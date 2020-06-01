const cache = require('memory-cache');

function deleteEvidences(hearingId) {
  cache.del(`${hearingId}.evidence`);
}

module.exports = {
  path: '/api/continuous-online-hearings/:onlineHearingId/evidence',
  method: 'POST',
  status: (req, res, next) => {
    deleteEvidences(req.params.onlineHearingId);
    next();
  }
};
