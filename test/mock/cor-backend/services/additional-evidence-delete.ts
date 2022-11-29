const { NO_CONTENT } = require('http-status-codes');
const cache = require('memory-cache');

export = {
  path: '/api/continuous-online-hearings/:onlineHearingId/evidence/:fileId',
  method: 'DELETE',
  cache: false,
  status: (req, res, next) => {
    const cacheKey = `${req.params.onlineHearingId}.evidence`;
    const uploadedEvidence = cache.get(cacheKey);
    cache.put(
      cacheKey,
      uploadedEvidence.filter((file) => file.id !== req.params.fileId)
    );
    res.status(NO_CONTENT);
    next();
  },
};
