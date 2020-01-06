const oralAppealStages = [
  {
    status: 'APPEAL_RECEIVED',
    title: 'Appeal',
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'WITH DWP',
    title: 'Appeal',
    latestUpdateText: 'text',
    showOnBar: false
  },
  {
    status: 'DWP_RESPOND',
    title: 'DWP response',
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'POSTPONED',
    showOnBar: false
  },
  {
    status: 'ADJOURNED',
    showOnBar: false
  },
  {
    status: 'HEARING_BOOKED',
    title: 'Hearing booked',
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'NEW_HEARING_BOOKED',
    showOnBar: false
  },
  {
    status: 'DORMANT',
    title: 'Hearing',
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: 'Closed',
    latestUpdateText: 'text',
    showOnBar: true
  }
];

const paperAppealStages = [
  {
    status: 'APPEAL_RECEIVED',
    title: 'Appeal',
    latestUpdateText: 'text',
    showOnBar: true
  }, {
    status: 'DWP_RESPOND',
    title: 'DWP response',
    latestUpdateText: 'text',
    showOnBar: true
  }, {
    status: 'DORMANT',
    title: 'Hearing',
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: 'Closed',
    latestUpdateText: 'text',
    showOnBar: true
  }
];

const corAppealStages = [
  {
    status: 'SYA_APPEAL_CREATED',
    title: 'Stages',
    latestUpdateText: 'text',
    showOnBar: true
  }, {
    status: 'DWP_RESPOND',
    title: 'for COR appeal',
    latestUpdateText: 'text',
    showOnBar: true
  }, {
    status: 'HEARING',
    title: 'still to',
    latestUpdateText: 'text',
    showOnBar: true
  }, {
    status: 'HEARING 2',
    title: 'define',
    latestUpdateText: 'text',
    showOnBar: true
  }
];

export {
  corAppealStages,
  oralAppealStages,
  paperAppealStages
};
