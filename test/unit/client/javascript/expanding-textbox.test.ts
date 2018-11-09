import { expect } from 'test/chai-sinon';
import * as expandingTextBox from 'app/client/javascript/expanding-textbox';

describe('expanding-textbox', () => {
  before(() => {
    document.body.innerHTML = '<textarea class="auto-expand" style="border-top: 2px; border-bottom: 2px;"></textarea>';
  });
  describe('#autoExpand', () => {
    it('sets height to scroll height + border widths', () => {
      const target = document.querySelector<HTMLInputElement>('textarea.auto-expand');
      expect(target.style).to.have.property('height', '');
      expandingTextBox.autoExpand({ target });
      expect(target.style).to.have.property('height', '4px');
    });
  });
});

export { };
