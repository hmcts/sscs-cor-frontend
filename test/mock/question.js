module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId/questions/:questionId',
  template: {
    question_id: params => `${params.questionId}`,
    question_header_text: 'Hey friend!'
  }
};
