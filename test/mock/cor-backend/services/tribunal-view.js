const { NO_CONTENT } = require('http-status-codes');
const cache = require('memory-cache');

module.exports = {
  path: '/continuous-online-hearings/:hearingId/tribunal-view',
  method: 'PATCH',
  status: (req, res, next) => {
    cache.put('tribunalViewReply', req.body.reply);
    res.status(NO_CONTENT);
    next();
  }
};
