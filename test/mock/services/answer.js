const { NO_CONTENT } = require('http-status-codes');

module.exports = {
  path: '/continuous-online-hearings/:hearingId/questions/:questionId',
  method: 'PUT',
  status: (req, res, next) => {
    res.status(NO_CONTENT);
    next();
  }
};
