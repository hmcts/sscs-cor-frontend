/* eslint-disable prefer-const, camelcase, no-undef */

import { deleteUser } from 'test/fixtures/sidam';

let Helper = codecept_helper;

class TeardownHelper extends Helper {
  deleteIdamUser(sidamUser) {
    console.log(`Deleting user ${sidamUser.email}`);
    return deleteUser(sidamUser);
  }
}

module.exports = TeardownHelper;