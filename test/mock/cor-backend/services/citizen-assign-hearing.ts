const { OK } = require('http-status-codes');
const {
  emailHearingIdMap,
  emailToCaseIdMap,
  emailToResCodeMap,
  createFinalDecision,
  hasFinalDecision,
  createDecision,
  getApellantDetails,
  getHearingArrangements,
} = require('../utils');

export = {
  path: '/api/citizen/:tya',
  method: 'POST',
  cache: false,
  status: (req, res, next) => {
    res.status(emailToResCodeMap[req.query.email] || OK);
    next();
  },
  template: {
    appellant_name: 'Adam Jenkins',
    case_reference: '112233',
    case_id: (params, query, body) => emailToCaseIdMap[body.email],
    online_hearing_id: (params, query, body) => emailHearingIdMap[body.email],
    decision: (params, query, body) => createDecision(body.email),
    final_decision: (params, query, body) => createFinalDecision(body.email),
    has_final_decision: (params, query, body) => hasFinalDecision(body.email),
    user_details: (params, query, body) => getApellantDetails(body.email),
    hearing_arrangements: () => getHearingArrangements(),
  },
};
