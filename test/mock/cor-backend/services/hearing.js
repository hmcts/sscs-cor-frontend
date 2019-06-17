const { OK, NOT_FOUND, UNPROCESSABLE_ENTITY, CONFLICT } = require('http-status-codes');
const cache = require('memory-cache');
const moment = require('moment');

const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY,
  'not.cor@example.com': CONFLICT
};
const emailHearingIdMap = {
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired',
  'view.issued@example.com': '4-view-issued',
  'view.issued.accepted@example.com': '4a-view-issued',
  'view.issued.rejected@example.com': '4b-view-issued',
  'appeal.upheld@example.com': '5-appeal-upheld',
  'appeal.denied@example.com': '6-appeal-denied'
};

const emailToCaseIdMap = {
  'appeal.received@example.com': '1234567890',
  'appeal.paper.received@example.com': '2345678901'
};

const createFinalDecision = email => {
  const finalDecisionEmails = [
    'appeal.upheld@example.com',
    'appeal.denied@example.com'
  ];

  if (finalDecisionEmails.includes(email)) {
    return { reason: 'final decision reason' };
  }
  return {};
};

const hasFinalDecision = email => {
  const finalDecisionEmails = [
    'appeal.upheld@example.com',
    'appeal.denied@example.com'
  ];

  return finalDecisionEmails.includes(email);
};

const createDecision = email => {
  const decisionIssued = cache.get('decisionIssued');
  const tribunalViewReply = cache.get('tribunalViewReply');
  const decisionEmails = [
    'view.issued@example.com',
    'view.issued.accepted@example.com',
    'view.issued.rejected@example.com',
    'appeal.upheld@example.com',
    'appeal.denied@example.com'
  ];
  if (decisionIssued || decisionEmails.includes(email)) {
    let decisionState = 'decision_issued';
    if (email === 'appeal.upheld@example.com') {
      decisionState = 'decision_accepted';
    }
    if (email === 'appeal.denied@example.com') {
      decisionState = 'decision_rejected';
    }
    let appellantReply = {};
    if (tribunalViewReply) {
      appellantReply = {
        appellant_reply: tribunalViewReply,
        appellant_reply_datetime: moment.utc()
      };
    }
    if (email === 'view.issued.accepted@example.com') {
      appellantReply = {
        appellant_reply: 'decision_accepted',
        appellant_reply_datetime: moment.utc().subtract(1, 'day')
      };
    }
    if (email === 'view.issued.rejected@example.com') {
      appellantReply = {
        appellant_reply: 'decision_rejected',
        appellant_reply_datetime: moment.utc().subtract(1, 'day')
      };
    }
    return {
      decision_award: email === 'appeal.denied@example.com' ? 'appeal-denied' : 'appeal-upheld',
      decision_header: email === 'appeal.denied@example.com' ? 'appeal-denied' : 'appeal-upheld',
      decision_reason: 'The final decision is this.',
      decision_rates: {
        compared_to_dwp: 'Higher',
        daily_living: 'noAward',
        mobility: 'noAward'
      },
      activities: {
        daily_living: [
          { activity: 'preparingFood', selection_key: '8' },
          { activity: 'washingBathing', selection_key: '2.0' }
        ],
        mobility: [{ activity: 'movingAround', selection_key: '12.1' }]
      },
      start_date: '2017-01-05',
      end_date: '2018-10-05',
      reason: 'The final decision is this.',
      decision_state: decisionState,
      decision_state_datetime: moment.utc().format(),
      ...appellantReply
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
    case_id: (params, query) => emailToCaseIdMap[query.email],
    online_hearing_id: (params, query) => emailHearingIdMap[query.email] || '1-pending',
    decision: (params, query) => createDecision(query.email),
    final_decision: (params, query) => createFinalDecision(query.email),
    has_final_decision: (params, query) => hasFinalDecision(query.email)
  }
};
