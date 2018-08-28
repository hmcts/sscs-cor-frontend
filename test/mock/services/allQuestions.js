const moment = require('moment');

const hearingIdToDeadlineStatusMap = {
  '2-completed': 'completed',
  '3-expired': 'expired'
};

function deadlineDate(hearingId) {
  const status = hearingIdToDeadlineStatusMap[hearingId];
  if (status === 'expired') {
    return moment().utc().subtract(1, 'day').endOf('day').format();
  }
  /* eslint-disable-next-line no-magic-numbers */
  return moment().utc().add(7, 'days').endOf('day').format();
}

function answerState(hearingId, defaultValue) {
  const status = hearingIdToDeadlineStatusMap[hearingId];
  return status === 'completed' ? 'submitted' : defaultValue;
}

module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId',
  method: 'GET',
  template: {
    deadline_expiry_date: params => deadlineDate(params.onlineHearingId),
    questions: params => [
      {
        question_id: '001',
        question_header_text: 'How do you interact with people?',
        answer_state: answerState(params.onlineHearingId, 'draft')
      }, {
        question_id: '002',
        question_header_text: 'How do you walk to the doctors?',
        answer_state: answerState(params.onlineHearingId, 'submitted')
      }, {
        question_id: '003',
        question_header_text: 'Tell us about your migraines',
        answer_state: answerState(params.onlineHearingId, 'unanswered')
      }
    ]
  }
};
