import { dateFormat } from '../../../app/server/utils/dateUtils';

const { expect } = require('test/chai-sinon');

describe('#dd_mm_yyyyFormat', function () {
  it('should return YYYY-MM-DD date in DD-MM-YYYY format', function () {
    expect(dateFormat('2020-11-19', 'YYYY-MM-DD')).to.equal('19-11-2020');
  });

  it('should return YYYY/MM/DD date in DD-MM-YYYY format', function () {
    expect(dateFormat('2020/11/19', 'YYYY/MM/DD')).to.equal('19-11-2020');
  });
});
