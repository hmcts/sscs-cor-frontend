const cache = require('memory-cache');

export = {
  path: '/continuous-online-hearings/:onlineHearingId/decisions',
  method: 'PUT',
  status: (req, res, next) => {
    cache.put('decisionIssued', true);
    cache.del('tribunalViewReply');
    next();
  },
};
