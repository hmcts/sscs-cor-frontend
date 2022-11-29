const {
  NOT_FOUND,
  UNPROCESSABLE_ENTITY,
  CONFLICT,
} = require('http-status-codes');
const cache = require('memory-cache');
const moment = require('moment');

export const emailHearingIdMap = {
  'no.questions@example.com': '0-no-questions',
  'pending@example.com': '1-pending',
  'completed@example.com': '2-completed',
  'expired@example.com': '3-expired',
  'view.issued@example.com': '4-view-issued',
  'view.issued.accepted@example.com': '4a-view-issued',
  'view.issued.rejected@example.com': '4b-view-issued',
  'appeal.upheld@example.com': '5-appeal-upheld',
  'appeal.denied@example.com': '6-appeal-denied',
};

export const emailToCaseIdMap = {
  'oral.appealReceived@example.com': '1',
  'oral.dwpRespond@example.com': '2',
  'oral.hearingBooked@example.com': '3',
  'oral.hearing@example.com': '4',
  'oral.postponed@example': '5',
  'oral.newHearingBooked@example.com': '6',
  'oral.closed@example.com': '7',
  'oral.withdrawn@example.com': '8',
  'oral.lapsed@example.com': '9',
  'paper.appealReceived@example.com': '10',
  'paper.dwpRespond@example': '11',
};

export const emailToResCodeMap = {
  'not.found@example.com': NOT_FOUND,
  'multiple@example.com': UNPROCESSABLE_ENTITY,
  'not.cor@example.com': CONFLICT,
};

export const createFinalDecision = (email) => {
  const finalDecisionEmails = [
    'appeal.upheld@example.com',
    'appeal.denied@example.com',
  ];

  if (finalDecisionEmails.includes(email)) {
    return { reason: 'final decision reason' };
  }
  return {};
};

export const hasFinalDecision = (email) => {
  const finalDecisionEmails = [
    'appeal.upheld@example.com',
    'appeal.denied@example.com',
  ];

  return finalDecisionEmails.includes(email);
};

export const createDecision = (email) => {
  const decisionIssued = cache.get('decisionIssued');
  const tribunalViewReply = cache.get('tribunalViewReply');
  const decisionEmails = [
    'view.issued@example.com',
    'view.issued.accepted@example.com',
    'view.issued.rejected@example.com',
    'appeal.upheld@example.com',
    'appeal.denied@example.com',
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
        appellant_reply_datetime: moment.utc(),
      };
    }
    if (email === 'view.issued.accepted@example.com') {
      appellantReply = {
        appellant_reply: 'decision_accepted',
        appellant_reply_datetime: moment.utc().subtract(1, 'day'),
      };
    }
    if (email === 'view.issued.rejected@example.com') {
      appellantReply = {
        appellant_reply: 'decision_rejected',
        appellant_reply_datetime: moment.utc().subtract(1, 'day'),
      };
    }
    return {
      decision_award:
        email === 'appeal.denied@example.com'
          ? 'appeal-denied'
          : 'appeal-upheld',
      decision_header:
        email === 'appeal.denied@example.com'
          ? 'appeal-denied'
          : 'appeal-upheld',
      decision_reason: 'The final decision is this.',
      decision_rates: {
        compared_to_dwp: 'Higher',
        daily_living: 'noAward',
        mobility: 'noAward',
      },
      activities: {
        daily_living: [
          { activity: 'preparingFood', selection_key: '8' },
          { activity: 'washingBathing', selection_key: '2.0' },
        ],
        mobility: [{ activity: 'movingAround', selection_key: '12.1' }],
      },
      start_date: '2017-01-05',
      end_date: '2018-10-05',
      reason: 'The final decision is this.',
      decision_state: decisionState,
      decision_state_datetime: moment.utc().format(),
      ...appellantReply,
    };
  }
  return null;
};

export const getApellantDetails = (email) => {
  return {
    email,
    phone: '07972438178',
    mobile: '07972438178',
    address_details: {
      line1: '14 Oxford Road',
      line2: 'Hastings',
      town: 'East Sussex',
      county: 'Sussex',
      postcode: 'TN38 6EW',
    },
  };
};

export const getHearingArrangements = () => {
  return {
    disabled_access_required: true,
    hearing_loop_required: true,
    language_interpreter: true,
    languages: 'English French',
    other_arrangements: 'Hearing room near to a toilet',
    sign_language_interpreter: true,
    sign_language_type: 'BSL ASL',
  };
};
