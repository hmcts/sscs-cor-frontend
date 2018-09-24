import * as moment from 'moment';

module.exports = {
  path: '/continuous-online-hearings/:hearingId',
  method: 'PATCH',
  cache: false,
  template: {
    /* eslint-disable no-magic-numbers */
    deadline_expiry_date: moment().utc().add(14, 'day').format()
  }
};
