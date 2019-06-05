const oralAppealReceived = require('../data/oral/appealReceived');
const paperAppealReceived = require('../data/paper/appealReceived');

function getAppeal(appealNumber) {
  switch (appealNumber) {
  case 'appeal.received@example.com':
    return oralAppealReceived;
  case 'appeal.paper.received@example.com':
    return paperAppealReceived;
  default:
    return {};
  }
}

module.exports = {
  path: '/appeals/:appealNumber',
  method: 'GET',
  cache: false,
  template: params => getAppeal(params.appealNumber)
};