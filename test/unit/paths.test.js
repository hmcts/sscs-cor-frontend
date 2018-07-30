const { expect } = require('test/chai-sinon');
const paths = require('paths');

describe('paths.js', () => {
  it('should return an object', () => {
    expect(paths).to.be.an('object');
  });
});
