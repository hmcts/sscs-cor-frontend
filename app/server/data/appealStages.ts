const oralAppealStages = [
  {
    status: 'APPEAL_RECEIVED',
    title: {
      en: 'Appeal',
      cy: 'Apêl'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'WITH_DWP',
    title: {
      en: 'Appeal',
      cy: 'Apêl'
    },
    latestUpdateText: 'text',
    showOnBar: false
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'DWP response',
      cy: 'Ymateb DWP'
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
      cy: 'Gwrandawiad wedi’i drefnu'
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
      cy: 'Gwrandawiad'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: {
      en: 'Closed',
      cy: 'Wedi cau'
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
      cy: 'Apêl'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'WITH_DWP',
    title: {
      en: 'Appeal',
      cy: 'Apêl'
    },
    latestUpdateText: 'text',
    showOnBar: false
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'DWP response',
      cy: 'Ymateb DWP'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'DORMANT',
    title: {
      en: 'Hearing',
      cy: 'Gwrandawiad'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'CLOSED',
    title: {
      en: 'Closed',
      cy: 'Wedi cau'
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
      cy: 'Camau'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'DWP_RESPOND',
    title: {
      en: 'for COR appeal',
      cy: 'at gyfer apêl Datrys Achosion Ar-lein'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'HEARING',
    title: {
      en: 'still to',
      cy: 'dal i’w'
    },
    latestUpdateText: 'text',
    showOnBar: true
  },
  {
    status: 'HEARING 2',
    title: {
      en: 'define',
      cy: 'ddiffinio'
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
      cy: 'Wedi cau'
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
