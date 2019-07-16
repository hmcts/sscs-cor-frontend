const { expect } = require('test/chai-sinon');
import { spellNumbersOut } from '../../../app/server/utils/screenReaderUtils';

describe('#screenReaderUtils', () => {
  it('should spell out a case reference', () => {
    expect(spellNumbersOut('SC/123/133')).to.equal('S C. 1 2 3. 1 3 3');
  });

  it('should spell out a long number', () => {
    expect(spellNumbersOut('0782  922 300')).to.equal('0 7 8 2. 9 2 2. 3 0 0');
  });

  it('should handled undefined name', () => {
    const word = undefined;
    expect(spellNumbersOut(word)).to.equal(word);
  });
});
