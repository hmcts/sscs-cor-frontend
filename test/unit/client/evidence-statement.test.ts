import { expect } from 'test/chai-sinon';
import { EvidenceStatement } from 'app/client/javascript/evidence-statement';

const html = `
    <div id="upload-spinner"></div>
     <input id="submit-statement">
    </div>`;

describe('evidence-statement', () => {
  let evidenceStatement;
  let body;
  before(() => {
    body = document.querySelector('body');
    body.innerHTML = html;
    evidenceStatement = new EvidenceStatement();
  });

  describe('#showSpinnerOnSubmitStatementClick', () => {
    it('hides submit statement button when clicked', () => {
      const submitSpinner = document.getElementById('upload-spinner');
      const submitStatement: HTMLElement = document.getElementById('submit-statement');
      evidenceStatement.submitStatementEventListener();
      submitStatement.click();
      expect(submitSpinner.style.display).to.equal('block');
      expect(submitStatement.style.display).to.equal('none');
    });
  });
});
