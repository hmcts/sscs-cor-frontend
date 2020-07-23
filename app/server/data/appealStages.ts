const oralAppealStages = [
  {
    status: 'APPEAL_RECEIVED',
    title: {
      en: 'Appeal',
      cy: '[CY] Appeal'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'WITH_DWP',
    title: {
      en: 'Appeal',
      cy: '[CY] Appeal'
    },
    latestUpdateText: 'text',
    showOnBar: false
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'DWP response',
      cy: '[CY] DWP response'
    },
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
    title: {
      en: 'Hearing booked',
      cy: '[CY] Hearing booked'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'NEW_HEARING_BOOKED',
    showOnBar: false
  },
  {
    status: 'DORMANT',
    title: {
      en: 'Hearing',
      cy: '[CY] Hearing'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: {
      en: 'Closed',
      cy: '[CY] Closed'
    },
    latestUpdateText: 'text',
    showOnBar: true
  }
];

const paperAppealStages = [
  {
    status: 'APPEAL_RECEIVED',
    title: {
      en: 'Appeal',
      cy: '[CY] Appeal'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'WITH_DWP',
    title: {
      en: 'Appeal',
      cy: '[CY] Appeal'
    },
    latestUpdateText: 'text',
    showOnBar: false
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'DWP response',
      cy: '[CY] DWP response'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'DORMANT',
    title: {
      en: 'Hearing',
      cy: '[CY] Hearing'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: {
      en: 'Closed',
      cy: '[CY] Closed'
    },
    latestUpdateText: 'text',
    showOnBar: true
  }
];

const corAppealStages = [
  {
    status: 'SYA_APPEAL_CREATED',
    title: {
      en: 'Stages',
      cy: '[CY] Stages'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'for COR appeal',
      cy: '[CY] for COR appeal'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'HEARING',
    title: {
      en: 'still to',
      cy: '[CY] still to'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'HEARING 2',
    title: {
      en: 'define',
      cy: '[CY] define'
    },
    latestUpdateText: 'text',
    showOnBar: true
  }
];

const closedAppealStages = [
  {
    status: 'CLOSED',
    title: {
      en: 'Closed',
      cy: '[CY] Closed'
    },
    latestUpdateText: 'text',
    showOnBar: true
  }
];

export {
  corAppealStages,
  oralAppealStages,
  paperAppealStages,
  closedAppealStages
};
