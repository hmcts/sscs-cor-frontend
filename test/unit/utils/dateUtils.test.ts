import { dateFormat } from '../../../app/server/utils/dateUtils';
import * as CONST from '../../../app/constants';

const { expect } = require('test/chai-sinon');

describe('dateUtil class', function () {
  it('should return YYYY-MM-DD date in DD-MM-YYYY format', function () {
    expect(dateFormat('2020-11-09', 'DD-MM-YYYY')).to.equal('09-11-2020');
  });

  it('should return YYYY/MM/DD date in DD-MM-YYYY format', function () {
    expect(dateFormat('2020/11/09', 'DD-MM-YYYY')).to.equal('09-11-2020');
  });

  it('should return YYYY/MM/DD date in default format and locale correctly', function () {
    expect(dateFormat('2020/11/09')).to.equal('9 November 2020');
  });

  it('should return YYYY/MM/DD date in the default en format correctly', function () {
    expect(dateFormat('2020/11/09', CONST.DATE_FORMAT, 'en')).to.equal(
      '9 November 2020'
    );
  });

  it('should return YYYY/MM/DD date in the default cy format correctly', function () {
    expect(dateFormat('2020/11/09', CONST.DATE_FORMAT, 'cy')).to.equal(
      '9 Tachwedd 2020'
    );
  });

  it('should return YYYY/MM/DD date in the D MMMM YYYY format correctly', function () {
    expect(dateFormat('2020/11/09', 'D MMMM YYYY')).to.equal('9 November 2020');
  });

  it('should return YYYY/MM/DD date in the DD MMMM YYYY format correctly', function () {
    expect(dateFormat('2020/11/09', 'DD MMMM YYYY')).to.equal(
      '09 November 2020'
    );
  });

  it('should return Invalid date on error', function () {
    expect(dateFormat('@')).to.equal('Invalid date');
  });
});
