import oralAppealReceived from '../data/oral/appealReceived.json';
import oralDWPRespond from '../data/oral/dwpRespond.json';
import oralHearingBooked from '../data/oral/hearingBooked.json';
import oralHearing from '../data/oral/hearing.json';
import oralAppealPostponed from '../data/oral/postponed.json';
import oralNewHearingBooked from '../data/oral/newHearingBooked.json';
import oralClosed from '../data/oral/closed.json';
import oralWithdrawn from '../data/oral/withdrawn.json';
import oralLapsed from '../data/oral/lapsedRevised.json';
import paperAppealReceived from '../data/paper/appealReceived.json';
import paperDWPRespond from '../data/paper/dwpRespond.json';
import corAppealCreated from '../data/cor/appealCreated.json';

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

export default {
  path: '/appeals',
  method: 'GET',
  cache: false,
  template: (params, query) => getAppeal(query.caseId),
};
