import { expect } from 'test/chai-sinon';
import { Paths } from 'app/server/paths';

describe('paths.ts', () => {
  it('should return an object', () => {
    expect(Paths).to.be.an('object');
    expect(Paths.completed).to.be.a('string')
  });
});
