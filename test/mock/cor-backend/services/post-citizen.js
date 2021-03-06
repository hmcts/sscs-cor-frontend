const { emailHearingIdMap, emailToCaseIdMap } = require('../utils');

module.exports = {
  path: '/api/citizen/:tya',
  method: 'POST',
  cache: false,
  template: {
    online_hearing_id: (params, query, body) => emailHearingIdMap[body.email],
    case_id: (params, query, body) => emailToCaseIdMap[body.email]
  }
};
