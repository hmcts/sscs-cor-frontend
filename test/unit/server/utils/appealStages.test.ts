import { oralAppealStages } from 'app/server/data/appealStages';
import { getActiveStages } from 'app/server/utils/appealStages';

import { expect } from 'test/chai-sinon';

describe('getActiveStatus', function () {
  it('should return stages array with states', function () {
    const oralStages = oralAppealStages
      .map((stage) => {
        if (stage.status === 'APPEAL_RECEIVED')
          return { ...stage, active: true };
        return { ...stage, active: false };
      })
      .filter((stage) => stage.showOnBar);
    expect(getActiveStages('APPEAL_RECEIVED', oralAppealStages)).to.eql(
      oralStages
    );
  });
});
