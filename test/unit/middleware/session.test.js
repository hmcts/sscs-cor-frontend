const { expect } = require('test/chai-sinon');
const createSession = require('app/middleware/session');

/* eslint-disable init-declarations */
describe('middleware/session', () => {
  it('exports session middleware function', () => {
    expect(createSession()).to.be.a('function');
  });
});
