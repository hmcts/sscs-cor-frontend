const { OK, NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');
const cache = require('memory-cache');

const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY
};
const emailHearingIdMap = {
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired',
  'view.issued@example.com': '4-view-issued',
  'appeal.upheld@example.com': '5-appeal-upheld',
  'appeal.denied@example.com': '6-appeal-denied'
};

const createDecision = email => {
  const decisionIssued = cache.get('decisionIssued');
  const decisionEmails = ['view.issued@example.com', 'appeal.upheld@example.com', 'appeal.denied@example.com'];
  if (decisionIssued || decisionEmails.includes(email)) {
    let decisionState = 'decision_issued';
    if (email === 'appeal.upheld@example.com') {
      decisionState = 'decision_accepted';
    }
    if (email === 'appeal.denied@example.com') {
      decisionState = 'decision_rejected';
    }
    return {
      decision_award: email === 'appeal.denied@example.com' ? 'appeal-denied' : 'appeal-upheld',
      decision_header: email === 'appeal.denied@example.com' ? 'appeal-denied' : 'appeal-upheld',
      decision_reason: 'The final decision is this.',
      decision_text: 'The final decision is this.',
      decision_state: decisionState
    };
  }
  return null;
};

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
    online_hearing_id: (params, query) => emailHearingIdMap[query.email] || '1-pending',
    decision: (params, query) => createDecision(query.email)
  }
};
