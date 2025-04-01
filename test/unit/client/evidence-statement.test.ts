import { expect } from 'test/chai-sinon';
import { EvidenceStatement } from 'app/client/javascript/evidence-statement';

const html = `
    <div id="upload-spinner"></div>
     <input id="submit-statement">
    </div>`;

describe('evidence-statement', function () {
  let evidenceStatement;
  let body;

  before(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
    evidenceStatement = new EvidenceStatement();
  });

  describe('#showSpinnerOnSubmitStatementClick', function () {
    it('hides submit statement button when clicked', function () {
      const submitSpinner = document.getElementById('upload-spinner');
      const submitStatement: HTMLElement =
        document.getElementById('submit-statement');
      evidenceStatement.submitStatementEventListener();
      submitStatement.click();
      expect(submitSpinner.style.display).to.equal('block');
      expect(submitStatement.style.display).to.equal('none');
    });
  });
});
