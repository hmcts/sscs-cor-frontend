export = {
  path: '/continuous-online-hearings/:onlineHearingId/decisions',
  method: 'GET',
  template: {
    deadline_expiry_date: 'string',
    decision_award: 'appeal-upheld',
    decision_header: 'appeal-upheld',
    decision_id: 'string',
    decision_reason: 'This is the decision.',
    decision_replies: [
      {
        author_reference: 'string',
        decision_id: 'string',
        decision_reply: 'string',
        decision_reply_date: 'string',
        decision_reply_id: 'string',
        decision_reply_reason: 'string',
        uri: 'string',
      },
    ],
    decision_state: {
      state_datetime: 'string',
      state_desc: 'string',
      state_name: 'decision_issued',
    },
    decision_text: 'This is the decision.',
    history: [
      {
        state_datetime: 'string',
        state_desc: 'string',
        state_name: 'string',
      },
    ],
    online_hearing_id: '4-decision-upheld',
    uri: 'string',
  },
};
