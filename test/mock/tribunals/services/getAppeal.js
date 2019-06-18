const oralAppealReceived = require('../data/oral/appealReceived');
const oralDWPRespond = require('../data/oral/dwpRespond');
const oralHearingBooked = require('../data/oral/hearingBooked');
const oralHearing = require('../data/oral/hearing');

const paperAppealReceived = require('../data/paper/appealReceived');

function getAppeal(appealNumber) {
  switch (appealNumber) {
  case '1':
    return oralAppealReceived;
  case '2':
    return oralHearingBooked;
  case '3':
    return oralHearing;
  case '2345678901':
    return paperAppealReceived;
  default:
    return oralDWPRespond;
  }
}

module.exports = {
  path: '/appeals',
  method: 'GET',
  cache: false,
  template: (params, query) => getAppeal(query.caseId)
};