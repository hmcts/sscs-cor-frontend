const { expect } = require('test/chai-sinon');
const { createSession } = require('app/server/middleware/session.ts');

describe('middleware/session', () => {
  it('exports session middleware function', () => {
    expect(createSession()).to.be.a('function');
  });
});

export {};