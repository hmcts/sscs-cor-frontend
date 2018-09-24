const moment = require('moment');
// const cache = require('memory-cache');

// function cacheAnswerState(questionId) {
//   cache.put(`${questionId}.state`, 'submitted');
//   cache.put(`${questionId}.answer_datetime`, moment().utc().format());
// }

module.exports = {
  path: '/continuous-online-hearings/:hearingId',
  method: 'PATCH',
  cache: false,
  template: {
    /* eslint-disable no-magic-numbers */
    deadline_expiry_date: moment().utc().add(7, 'day').format()
  }
};
