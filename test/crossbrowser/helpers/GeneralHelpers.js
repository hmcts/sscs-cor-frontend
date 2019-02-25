/* eslint-disable prefer-const, camelcase, no-undef, padded-blocks */
const config = require('config');

const timeout = parseInt(config.get('saucelabs.waitForTimeout'));

class GeneralHelpers extends codecept_helper {

  waitForHeader(text) {
    return this.helpers.WebDriverIO.waitForText(text, timeout, 'h1');
  }
}

module.exports = GeneralHelpers;