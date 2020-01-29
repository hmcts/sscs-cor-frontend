const { OK } = require('http-status-codes');
const {
  emailHearingIdMap,
  emailToResCodeMap,
  createFinalDecision,
  hasFinalDecision,
  createDecision
} = require('../utils');

module.exports = {
  path: '/continuous-online-hearings',
  method: 'GET',
  cache: false,
  status: (req, res, next) => {
    res.status(emailToResCodeMap[req.query.email] || OK);
    next();
  },
  template: {
    appellant_name: 'Adam Jenkins',
    case_reference: 'SC/112/233',
    case_id: '123456789',
    online_hearing_id: (params, query) => emailHearingIdMap[query.email] || '1-pending',
    decision: (params, query) => createDecision(query.email),
    final_decision: (params, query) => createFinalDecision(query.email),
    has_final_decision: (params, query) => hasFinalDecision(query.email)
  }
};
