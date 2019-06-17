interface IAppealStage {
  status: string;
  title: string;
  latestUpdateText: string;
  active?: boolean;
}

function getActiveStages(status: string, stages: IAppealStage[]) {
  const statusIdx = stages.findIndex(stage => stage.status === status);
  return stages.map((stage, idx) => {
    if (idx <= statusIdx) return { ...stage, active: true };
    else return { ...stage, active: false };
  });
}

export {
  IAppealStage,
  getActiveStages
};
