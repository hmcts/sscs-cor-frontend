/* eslint-disable-next-line max-len */
const html = '<textarea class="auto-expand" style="border-top: 2px; border-bottom: 2px;"></textarea>';
require('jsdom-global')(html);
const { expect } = require('test/chai-sinon');
const expandingTextbox = require('app/assets/javascript/expanding-textbox');

describe('expanding-textbox', () => {
  describe('#autoExpand', () => {
    it('sets height to scroll height + border widths', () => {
      const target = document.querySelector('textarea.auto-expand');
      expect(target.style).to.have.property('height', '');
      expandingTextbox.autoExpand({ target });
      expect(target.style).to.have.property('height', '4px');
    });
  });
});
