/* eslint-disable prefer-const, camelcase, no-undef */
const { deleteIdamUser } = require('../../browser/teardown.ts');

let Helper = codecept_helper;

class TeardownHelper extends Helper {
  deleteUser(sidamUser) {
    console.log(`Deleting user ${sidamUser.email}`);
    return deleteIdamUser(sidamUser);
  }
}

module.exports = TeardownHelper;
