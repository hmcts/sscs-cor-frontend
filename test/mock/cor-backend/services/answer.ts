const { NO_CONTENT } = require('http-status-codes');
const cache = require('memory-cache');

function cacheAnswerState(questionId, answerText) {
  cache.put(`${questionId}.state`, 'draft');
  cache.put(`${questionId}.answer`, answerText);
}

export = {
  path: '/api/continuous-online-hearings/:hearingId/questions/:questionId',
  method: 'PUT',
  cache: false,
  status: (req, res, next) => {
    cacheAnswerState(req.params.questionId, req.body.answer);
    res.status(NO_CONTENT);
    next();
  },
};
