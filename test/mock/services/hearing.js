const { OK, NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');

const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY
};
const emailHearingIdMap = {
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired'
};

module.exports = {
  path: '/continuous-online-hearings',
  method: 'GET',
  status: (req, res, next) => {
    res.status(emailToResCodeMap[req.query.email] || OK);
    next();
  },
  template: {
    appellant_name: 'Adam Jenkins',
    case_reference: 'SC/112/233',
    online_hearing_id: (params, query) => emailHearingIdMap[query.email] || '1-pending'
  }
};
