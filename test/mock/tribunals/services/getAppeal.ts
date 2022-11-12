const oralAppealReceived = require('../data/oral/appealReceived');
const oralDWPRespond = require('../data/oral/dwpRespond');
const oralHearingBooked = require('../data/oral/hearingBooked');
const oralHearing = require('../data/oral/hearing');
const oralAppealPostponed = require('../data/oral/postponed');
const oralNewHearingBooked = require('../data/oral/newHearingBooked');
const oralClosed = require('../data/oral/closed');
const oralWithdrawn = require('../data/oral/withdrawn');
const oralLapsed = require('../data/oral/lapsedRevised');
const paperAppealReceived = require('../data/paper/appealReceived');
const paperDWPRespond = require('../data/paper/dwpRespond');
const corAppealCreated = require('../data/cor/appealCreated');

/* eslint-disable complexity */
function getAppeal(appealNumber) {
  switch (appealNumber) {
    case '1':
      return oralAppealReceived;
    case '2':
      return oralDWPRespond;
    case '3':
      return oralHearingBooked;
    case '4':
      return oralHearing;
    case '5':
      return oralAppealPostponed;
    case '6':
      return oralNewHearingBooked;
    case '7':
      return oralClosed;
    case '8':
      return oralWithdrawn;
    case '9':
      return oralLapsed;
    case '10':
      return paperAppealReceived;
    case '11':
      return paperDWPRespond;
    default:
      return corAppealCreated;
  }
}

export = {
  path: '/appeals',
  method: 'GET',
  cache: false,
  template: (params, query) => getAppeal(query.caseId),
};
