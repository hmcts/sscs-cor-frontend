import { expect, sinon } from 'test/chai-sinon';
import { RequestType } from 'app/client/javascript/request-type';

const html = `<div class="task-list">
              <h2 class="govuk-heading-m --margin-bottom-s">Select Request</h2>
              <form class="--padding-top-m" id="request-option-form" name="request-option-form" action="/request-type/select?_csrf=XwxonKnG-Cu_t51ws3yMgWogOBeYFcr3DM44" method="POST">
                  <div>
                      <div class="govuk-form-group">
                          <label class="govuk-label --font-weight-b --margin-none" for="request-options">
                      </label>
                      <select class="govuk-select" id="request-options" name="request-options">
                        <option value="select">--Select Request--</option>
                        <option value="hearingRecording">Hearing Recording</option>
                      </select>
                  </div>
                  </div>
              </form>
              </div>`;

describe('request-type', () => {
  let requestType;
  let body;
  before(() => {
    body = document.querySelector('body');
    body.innerHTML = html;
    requestType = new RequestType();
  });

  describe('constructor', () => {
    before(() => {
      document.querySelector<HTMLInputElement>('#request-options').addEventListener = sinon.spy();
    });
    describe('initialize class', () => {
      it('should attach Event Listeners', () => {
        const target = document.querySelector<HTMLSelectElement>('#request-options');
        expect(target.addEventListener).to.have.not.been.called;
        requestType.init();
        expect(target.addEventListener).to.have.been.called;
      });
    });
  });
  //
  // describe('select request type', () => {
  //   let submitStub: sinon.SinonStub;
  //   before(() => {
  //     submitStub = sinon.stub(HTMLFormElement.prototype, 'submit');
  //   });
  //   afterEach(() => {
  //     submitStub.restore();
  //   });
  //   describe('select request type', () => {
  //     it('should submit form', () => {
  //       const select = document.querySelector<HTMLSelectElement>('#request-options');
  //       requestType.init();
  //       select.value = 'hearingRecording';
  //       expect(submitStub).to.have.been.calledOnce;
  //     });
  //   });
  // });
});
