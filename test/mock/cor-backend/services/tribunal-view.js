const { NO_CONTENT } = require('http-status-codes');

module.exports = {
  path: '/continuous-online-hearings/:hearingId/tribunal-view',
  method: 'PATCH',
  status: (req, res, next) => {
    res.status(NO_CONTENT);
    next();
  }
};
