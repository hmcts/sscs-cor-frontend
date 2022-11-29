const cache = require('memory-cache');

function deleteEvidences(hearingId) {
  cache.del(`${hearingId}.evidence`);
}

export = {
  path: '/api/continuous-online-hearings/:onlineHearingId/evidence',
  method: 'POST',
  status: (req, res, next) => {
    deleteEvidences(req.params.onlineHearingId);
    next();
  },
};
