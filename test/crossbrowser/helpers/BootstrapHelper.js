/* eslint-disable prefer-const, camelcase, no-undef */

const { bootstrap } = require('../../browser/bootstrap.ts');

let Helper = codecept_helper;

class BootstrapHelper extends Helper {
  createTestAppealData() {
    return bootstrap();
  }
}

module.exports = BootstrapHelper;