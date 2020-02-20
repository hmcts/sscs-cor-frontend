const { expect } = require('test/chai-sinon');
import { spellNumbersOut } from '../../../app/server/utils/screenReaderUtils';

describe('#screenReaderUtils', () => {
  it('should spell out a case reference', () => {
    expect(spellNumbersOut('5123769133')).to.equal('5 1 2 3 7 6 9 1 3 3');
  });

  it('should spell out a long number', () => {
    expect(spellNumbersOut('0782  922 300')).to.equal('0 7 8 2. 9 2 2. 3 0 0');
  });

  it('should handled undefined name', () => {
    const word = undefined;
    expect(spellNumbersOut(word)).to.equal(word);
  });
});
