const { OK, NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');

const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY
};
const emailHearingIdMap = {
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired',
  'decision.issued@example.com': '4-decision-issued'
};

const createDecision = email => {
  if (email === 'decision.issued@example.com') {
    return {
      decision_award: 'FINAL',
      decision_header: 'Final decision',
      decision_reason: 'Just because',
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
