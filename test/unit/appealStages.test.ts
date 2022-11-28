import { expect, sinon } from 'test/chai-sinon';
import {
  corAppealStages,
  oralAppealStages,
  paperAppealStages,
} from '../../app/server/data/appealStages';

describe('Appeal stages', () => {
  it('should contain oral appeal stages', () => {
    expect(oralAppealStages).to.be.an('array');
  });

  it('should contain paper appeal stages', () => {
    expect(paperAppealStages).to.be.an('array');
  });

  it('should contain paper appeal stages', () => {
    expect(corAppealStages).to.be.an('array');
  });
});
