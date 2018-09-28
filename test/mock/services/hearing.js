const { OK, NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');

const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY
};
const emailHearingIdMap = {
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired',
  'appeal.upheld@example.com': '4-appeal-upheld',
  'appeal.denied@example.com': '5-appeal-denied'
};

const createDecision = email => {
  if (['appeal.upheld@example.com', 'appeal.denied@example.com'].includes(email)) {
    return {
      decision_award: email === 'appeal.upheld@example.com' ? 'appeal-upheld' : 'appeal-denied',
      decision_header: email === 'appeal.upheld@example.com' ? 'appeal-upheld' : 'appeal-denied',
      decision_reason: 'The final decision is this.',
      decision_text: 'The final decision is this.',
      decision_state: 'decision_issued'
    };
  }
  return null;
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
    online_hearing_id: (params, query) => emailHearingIdMap[query.email] || '1-pending',
    decision: (params, query) => createDecision(query.email)
  }
};
