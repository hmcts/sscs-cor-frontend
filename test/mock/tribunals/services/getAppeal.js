const oralAppealReceived = require('../data/oral/appealReceived');
const paperAppealReceived = require('../data/paper/appealReceived');

function getAppeal(appealNumber) {
  switch (appealNumber) {
  case '1234567890':
    return oralAppealReceived;
  case '2345678901':
    return paperAppealReceived;
  default:
    return {};
  }
}

module.exports = {
  path: '/appeals',
  method: 'GET',
  cache: false,
  template: (params, query) => getAppeal(query.caseId)
};