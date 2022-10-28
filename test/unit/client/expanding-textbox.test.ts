import { expect, sinon } from 'test/chai-sinon';
import * as expandingTextBox from 'app/client/javascript/expanding-textbox';

describe('expanding-textbox', () => {
  before(() => {
    document.body.innerHTML =
      '<textarea class="auto-expand" style="border-top: 2px; border-bottom: 2px;"></textarea>';
    document.querySelector<HTMLInputElement>(
      'textarea.auto-expand'
    ).addEventListener = sinon.spy();
  });
  describe('initialize class', () => {
    it('should attach Event Listeners', () => {
      const target = document.querySelector<HTMLInputElement>(
        'textarea.auto-expand'
      );
      expect(target.addEventListener).to.have.not.been.called;
      expandingTextBox.init();
      expect(target.addEventListener).to.have.been.called;
    });
  });
  describe('#autoExpand', () => {
    it('sets height to scroll height + border widths', () => {
      const target = document.querySelector<HTMLInputElement>(
        'textarea.auto-expand'
      );
      expect(target.style).to.have.property('height', '');
      expandingTextBox.autoExpand({ target });
      expect(target.style).to.have.property('height', '4px');
    });
  });
});
