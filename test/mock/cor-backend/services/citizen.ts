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
  path: '/api/citizen',
  method: 'GET',
  cache: false,
  status: (req, res, next) => {
    res.status(emailToResCodeMap[req.query.email] || OK);
    next();
  },
  template: [
    {
      appellant_name: 'Adam Jenkins',
      case_reference: '112233',
      case_id: (params, query) => emailToCaseIdMap[query.email],
      online_hearing_id: (params, query) => emailHearingIdMap[query.email],
      decision: (params, query) => createDecision(query.email),
      final_decision: (params, query) => createFinalDecision(query.email),
      has_final_decision: (params, query) => hasFinalDecision(query.email),
      user_details: (params, query) => getApellantDetails(query.email),
      hearing_arrangements: () => getHearingArrangements(),
    },
  ],
};
