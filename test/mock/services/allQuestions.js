module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId',
  method: 'GET',
  template: {
    questions: [
      {
        question_id: '001',
        question_header_text: 'How do you interact with people?',
        answer_state: 'draft'
      }, {
        question_id: '002',
        question_header_text: 'How do you walk to the doctors?',
        answer_state: 'submitted'
      }, {
        question_id: '003',
        question_header_text: 'Tell us about your migraines',
        answer_state: 'unanswered'
      }
    ]
  }
};
