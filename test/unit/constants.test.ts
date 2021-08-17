import { expect } from 'test/chai-sinon';
import * as CONST from 'app/constants';

describe('constants.ts', () => {
  it('should return 3 http retries', () => {
    expect(CONST.CONST.HTTP_RETRIES).to.equal(3);
  });
});
