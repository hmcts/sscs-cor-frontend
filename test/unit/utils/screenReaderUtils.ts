import { spellNumbersOut } from 'app/server/utils/screenReaderUtils';

const { expect } = require('test/chai-sinon');

describe('#screenReaderUtils', function () {
  it('should spell out a case reference', function () {
    expect(spellNumbersOut('5123769133')).to.equal('5 1 2 3 7 6 9 1 3 3');
  });

  it('should spell out a long number', function () {
    expect(spellNumbersOut('0782  922 300')).to.equal('0 7 8 2. 9 2 2. 3 0 0');
  });

  it('should handled undefined name', function () {
    const word = undefined;
    expect(spellNumbersOut(word)).to.equal(word);
  });
});
