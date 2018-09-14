import { expect } from 'test/chai-sinon';
import { JSDOM } from 'jsdom';

import { ExpandingTextBox } from 'app/client/javascript/expanding-textbox';

const html = '<textarea class="auto-expand" style="border-top: 2px; border-bottom: 2px;"></textarea>';
const jsdom = new JSDOM(html);
const document: Window['document'] = jsdom.window.document;
const $ = (global as any).$ = require('jquery')(jsdom.window);

describe('expanding-textbox', () => {
  describe('#autoExpand', () => {
    it('sets height to scroll height + border widths', () => {
      const expandingTextBox = new ExpandingTextBox();
      const target = document.querySelector<HTMLInputElement>('textarea.auto-expand');
      
      expect(target.style).to.have.property('height', '');
      expandingTextBox.autoExpand({target});
      expect(target.style).to.have.property('height', '4px');
    });
  });
});

export { };