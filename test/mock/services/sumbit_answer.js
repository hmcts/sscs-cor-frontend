const { NO_CONTENT } = require('http-status-codes');
const cache = require('memory-cache');

function cacheAnswerState(questionId) {
  cache.put(`${questionId}.state`, 'submitted');
}

module.exports = {
  path: '/continuous-online-hearings/:hearingId/questions/:questionId',
  method: 'POST',
  status: (req, res, next) => {
    cacheAnswerState(req.params.questionId, req.body.answer);
    res.status(NO_CONTENT);
    next();
  }
};
