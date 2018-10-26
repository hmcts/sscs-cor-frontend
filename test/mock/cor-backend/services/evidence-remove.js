const { NO_CONTENT } = require('http-status-codes');
// const cache = require('memory-cache');

module.exports = {
  path: '/continuous-online-hearings/:hearingId/questions/:questionId/evidence/:fileId',
  method: 'DELETE',
  cache: false,
  status: (req, res, next) => {
    // cache.del(`${req.params.hearingId}.${req.params.questionId}.${req.params.fileId}`);
    res.status(NO_CONTENT);
    next();
  }
};