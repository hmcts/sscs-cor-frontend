const { NO_CONTENT } = require('http-status-codes');
const cache = require('memory-cache');
const moment = require('moment');

function cacheAnswerState(questionId) {
  cache.put(`${questionId}.state`, 'submitted');
  cache.put(`${questionId}.answer_date`, moment().utc().format());
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
