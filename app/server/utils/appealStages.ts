interface IAppealStage {
  status: string;
  title?: {
    en: string;
    cy: string;
  };
  latestUpdateText?: string;
  active?: boolean;
  showOnBar: boolean;
}

function getActiveStages(status: string, stages: IAppealStage[]) {
  const statusIdx = stages.findIndex((stage) => stage.status === status);
  return stages
    .map((stage, idx) => {
      if (idx <= statusIdx) return { ...stage, active: true };
      return { ...stage, active: false };
    })
    .filter((stage) => stage.showOnBar);
}

export { IAppealStage, getActiveStages };
