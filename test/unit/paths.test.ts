import { expect } from 'test/chai-sinon';
import * as Paths from 'app/server/paths';

describe('paths.ts', function () {
  it('should return an object', function () {
    expect(Paths.completed).to.be.a('string');
  });
});
