const cache = require('memory-cache');
const moment = require('moment');
const questionData = require('./questionData');

const hearingIdToDeadlineStatusMap = {
  '2-completed': 'completed',
  '3-expired': 'expired'
};

function deadlineDate(hearingId) {
  const deadlineStatus = hearingIdToDeadlineStatusMap[hearingId];
  if (deadlineStatus === 'expired') {
    return moment().utc().subtract(1, 'day').endOf('day').format();
  }
  /* eslint-disable-next-line no-magic-numbers */
  return moment().utc().add(7, 'days').endOf('day').format();
}

function answerState(questionId, hearingId) {
  const DEFAULT_ANSWER_STATE = 'unanswered';
  const deadlineStatus = hearingIdToDeadlineStatusMap[hearingId];
  const cachedState = cache.get(`${questionId}.state`);
  return deadlineStatus === 'completed' ? 'submitted' : cachedState || DEFAULT_ANSWER_STATE;
}

module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId',
  method: 'GET',
  cache: false,
  template: {
    deadline_expiry_date: params => deadlineDate(params.onlineHearingId),
    questions: params => [
      {
        question_id: '001',
        question_header_text: questionData['001'].header,
        answer_state: answerState('001', params.onlineHearingId)
      }, {
        question_id: '002',
        question_header_text: questionData['002'].header,
        answer_state: answerState('002', params.onlineHearingId)
      }, {
        question_id: '003',
        question_header_text: questionData['003'].header,
        answer_state: answerState('003', params.onlineHearingId)
      }
    ]
  }
};
