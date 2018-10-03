const moment = require('moment');
const cache = require('memory-cache');

module.exports = {
  path: '/continuous-online-hearings/:hearingId',
  method: 'PATCH',
  cache: false,
  template: {
    /* eslint-disable no-magic-numbers */
    deadline_expiry_date: moment().utc().add(14, 'day').format()
  },
  status: (req, res, next) => {
    cache.put(`${req.params.hearingId}.extensionCount`, 1);
    next();
  }
};
