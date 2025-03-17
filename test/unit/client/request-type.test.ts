import { expect, sinon } from 'test/chai-sinon';
import { RequestType } from 'app/client/javascript/request-type';
import { SinonSpy } from 'sinon';

const html = `<div class="task-list">
              <h2 class="govuk-heading-m --margin-bottom-s">Select Request</h2>
              <form class="--padding-top-m" id="request-option-form" name="request-option-form" action="/request-type/select?_csrf=XwxonKnG-Cu_t51ws3yMgWogOBeYFcr3DM44" method="POST">
                  <div>
                      <div class="govuk-form-group">
                          <label class="govuk-label --font-weight-b --margin-none" for="request-options">
                      </label>
                      <select class="govuk-select" id="requestOptions" name="requestOptions">
                        <option value="select">--Select Request--</option>
                        <option value="hearingRecording">Hearing Recording</option>
                      </select>
                  </div>
                  </div>
              </form>
              </div>`;

describe('request-type', function () {
  let requestType: RequestType = null;
  let body: HTMLBodyElement = null;

  before(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
    requestType = new RequestType();
  });

  describe('constructor', function () {
    before(function () {
      const select: HTMLSelectElement =
        document.querySelector<HTMLSelectElement>('#requestOptions');
      select.addEventListener = sinon.spy();
    });

    describe('initialize class', function () {
      it('should attach Event Listeners', function () {
        const select: HTMLSelectElement =
          document.querySelector<HTMLSelectElement>('#requestOptions');
        expect(select.addEventListener).to.have.not.been.called;
        requestType.init();
        expect(select.addEventListener).to.have.been.called;
      });
    });
  });

  describe('select request type', function () {
    let submitSpy: SinonSpy;

    before(function () {
      const form = document.querySelector<HTMLFormElement>(
        '#request-option-form'
      );
      submitSpy = sinon.spy(form, 'submit');
      requestType.init();
    });

    afterEach(function () {
      submitSpy.restore();
    });

    describe('select request type', function () {
      it('should submit form', function () {
        const select: HTMLSelectElement =
          document.querySelector<HTMLSelectElement>('#requestOptions');
        expect(select.addEventListener).to.have.been.called;
        select.value = 'hearingRecording';
        select.dispatchEvent(new Event('change'));
        expect(submitSpy).to.have.been.calledOnce;
      });
    });
  });
});
