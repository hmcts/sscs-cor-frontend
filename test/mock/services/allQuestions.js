module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId',
  method: 'GET',
  template: {
    questions: [
      {
        question_id: '001',
        question_header_text: 'How do you interact with people?',
        current_question_state: {
          state_name: 'answer_drafted'
        }
      }, {
        question_id: '002',
        question_header_text: 'How do you walk to the doctors?',
        current_question_state: {
          state_name: 'answer_submitted'
        }
      }, {
        question_id: '003',
        question_header_text: 'Tell us about your migraines',
        current_question_state: {
          state_name: ''
        }
      }
    ]
  }
};
