/* eslint-disable-next-line max-len */
const { expect } = require('test/chai-sinon');

const { ExpandingTextBox } = require('app/client/javascript/expanding-textbox.ts')

const jsdom = require('jsdom-global');
const html = '<textarea class="auto-expand" style="border-top: 2px; border-bottom: 2px;"></textarea>';
jsdom(html);

describe('expanding-textbox', () => {
  describe('#autoExpand', () => {
    it('sets height to scroll height + border widths', () => {
      const target = document.querySelector<HTMLInputElement>('textarea.auto-expand');

      const expandingTextBox = new ExpandingTextBox();

      expect(target.style).to.have.property('height', '');
      expandingTextBox.autoExpand({ target });
      expect(target.style).to.have.property('height', '4px');
    });
  });
});

export {};