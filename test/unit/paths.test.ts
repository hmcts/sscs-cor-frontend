import { expect } from 'test/chai-sinon';
import * as Paths from 'app/server/paths';

describe('paths.ts', () => {
  it('should return an object', () => {
    expect(Paths.completed).to.be.a('string')
  });
});
