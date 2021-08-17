import { CONST } from '../../app/constants';
const { expect } = require('test/chai-sinon');

describe('/manage-email-notifications/mactoken', () => {
  it('should contain 1 field', () => {
    expect(CONST.HTTP_RETRIES).to.equal(3);
  });
});
