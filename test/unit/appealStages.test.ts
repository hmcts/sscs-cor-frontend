import { expect, sinon } from 'test/chai-sinon';
import {
  corAppealStages,
  oralAppealStages,
  paperAppealStages,
} from '../../app/server/data/appealStages';

describe('Appeal stages', function () {
  it('Oral Appeal Stages should contain oral appeal stages', function () {
    expect(oralAppealStages).to.be.an('array');
  });

  it('Paper Appeal Stages should contain paper appeal stages', function () {
    expect(paperAppealStages).to.be.an('array');
  });

  it('COR Appeal Stages should contain paper appeal stages', function () {
    expect(corAppealStages).to.be.an('array');
  });
});
