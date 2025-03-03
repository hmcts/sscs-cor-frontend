import { expect, sinon } from 'test/chai-sinon';
import { EvidenceUpload } from 'app/client/javascript/evidence-upload';
import { EvidenceUploadHelper } from 'app/client/javascript/evidence-upload-helper';

const html = `<form id="answer-form" action="/question/1?_csrf=12323" method="post">
    <input type="text" id="question-field" name="question-field"/>
</form>
<div id="evidence-upload">
<div class="govuk-form-group">
  <div class="govuk-checkboxes evidence-upload-js" style="display: block;">
    <div class="govuk-checkboxes__item">
      <input class="govuk-checkboxes__input" id="provide-evidence-1" name="provide-evidence" type="checkbox" value="yes">
      <label class="govuk-label govuk-checkboxes__label" for="provide-evidence-1">
        I want to provide evidence to support my answer
      </label>
    </div>
  </div>
</div>
      <div id="evidence-upload-reveal-container" class="govuk-details__text --margin-bottom-m" style="display: block;">
        <h2 class="govuk-heading-m evidence-upload-nojs" style="display: none;">Provide evidence to support your answer</h2>
        <p>You can upload evidence to support your answer such as letters, photos, video or audio. If you are taking a picture of a letter, place it on a flat surface and take the picture from above.</p>
<div class="govuk-form-group">
  <label class="govuk-button secondary-button" for="file-upload-1" style="">
    Choose file
  </label>
  <input class="govuk-file-upload evidence-upload-js" id="file-upload-1" name="file-upload-1" type="file" accept=".jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx" style="display: none;">
</div>
        <table class="govuk-table" id="files-uploaded">
  <thead class="govuk-table__head">
    <tr class="govuk-table__row">
      <th class="govuk-table__header" colspan="2">Uploaded files</th>
    </tr>
  </thead>
  <tbody class="govuk-table__body">
      <tr class="govuk-table__row">
        <td class="govuk-table__cell">No files uploaded</td>
        <td class="govuk-table__cell">&nbsp;</td>
      </tr>
  </tbody>
</table>
    <div id="uploadFileButton">
        <input id="add-file" name="add-file" type="submit" value="Add file" class="govuk-button secondary-button evidence-upload-nojs" style="display: none;">
    </div>
    <div id="upload-spinner"></div>
    <details id="sending-evidence-guide" class="govuk-details">
  <summary class="govuk-details__summary" role="button" aria-controls="details-content-00f525bb-889a-4507-af48-0eee2be4e967" aria-expanded="false">
    <span class="govuk-details__summary-text">
      You can also post evidence to the tribunal
    </span>
  </summary>
  <div class="govuk-details__text" id="details-content-00f525bb-889a-4507-af48-0eee2be4e967" aria-hidden="true">
    <p>You can post evidence to the address below.</p>
    <p>Make sure it’s clearly marked with your appeal reference number:<br>
      <strong id="evidence-case-reference">112233</strong>
    </p>
    <p>HMCTS SSCS<br/>PO BOX 12626<br/>Harlow<br/>CM20 9QF</p>
    <p>Try to post it as soon as possible to avoid delaying your appeal.</p>
  </div>
</details>
      </div>
    </div>`;

describe('evidence-upload', function () {
  let evidenceUpload: EvidenceUpload;
  let body;

  before(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
    evidenceUpload = new EvidenceUpload();
    evidenceUpload.evidenceUploadHelper = new EvidenceUploadHelper();
  });

  describe('#constructor', function () {
    it('hide no-JS elements', function () {
      const noJsElements: NodeListOf<HTMLElement> = body.querySelectorAll(
        evidenceUpload.NOJS_ELEMENT_SELECTOR
      );
      noJsElements.forEach((e) => expect(e.style.display).to.equal('none'));
    });

    it('shows JS elements with expection of file input', function () {
      const jsElements: NodeListOf<HTMLElement> = body.querySelectorAll(
        `${evidenceUpload.JS_ELEMENT_SELECTOR}:not(#${evidenceUpload.FILE_UPLOAD_ID})`
      );
      jsElements.forEach((e) => expect(e.style.display).to.equal('block'));
    });

    it('hide reveal container by default', function () {
      const revealContainer: HTMLElement = document.getElementById(
        evidenceUpload.REVEAL_CONTAINER_ID
      );
      expect(revealContainer.style.display).to.equal('none');
      expect(revealContainer.className).to.equal(
        'govuk-details__text --margin-bottom-m'
      );
    });

    it('sets file upload state', function () {
      const fileUpload: HTMLElement = document.getElementById(
        evidenceUpload.FILE_UPLOAD_ID
      );
      const fileUploadLabel: HTMLElement = body.querySelector(
        evidenceUpload.FILE_UPLOAD_LABEL_SELECTOR
      );
      expect(fileUpload.className).to.equal('file-display-none');
      expect(fileUploadLabel.style.display).to.equal('');
      expect(fileUploadLabel.className).to.equal(
        'govuk-button secondary-button'
      );
    });
  });

  /* describe('#showHideRevealContainer', () => {
    let revealContainer: HTMLElement;
    before(() => {
      revealContainer = document.getElementById(evidenceUpload.REVEAL_CONTAINER_ID);
    });
    it('hides if checkbox is not checked', () => {
      const target = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      target.checked = false;
      evidenceUpload.showHideRevealContainer({ target });
      expect(revealContainer.style.display).to.equal('none');
    });
    it('shows if checkbox is checked', () => {
      const target = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      target.checked = true;
      evidenceUpload.showHideRevealContainer({ target });
      expect(revealContainer.style.display).to.equal('block');
    });
    it('clicking the tickbox shows/hides the reveal', () => {
      const checkbox = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      checkbox.click();
      expect(revealContainer.style.display).to.equal('none');
      checkbox.click();
      expect(revealContainer.style.display).to.equal('block');
    });
  }); */

  /* describe('#setRevealStartState', () => {
    let revealContainer: HTMLElement;
    before(() => {
      revealContainer = document.getElementById(evidenceUpload.REVEAL_CONTAINER_ID);
    });
    it('starts hidden if no uploaded files exist and no upload errors', () => {
      evidenceUpload.setRevealStartState();
      const checkbox = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('none');
      expect(checkbox.checked).to.equal(false);
    });
    it('starts revealed if uploaded files exist', () => {
      document.querySelector('#files-uploaded tbody').innerHTML = `
        <tr class="govuk-table__row evidence">
          <td class="govuk-table__cell">My file.png</td>
          <td class="govuk-table__cell">
            <input type="hidden" name="id" value="147e9118-24bc-4e33-9586-053c341469f8">
            <input type="submit" name="delete" value="Delete" class="govuk-link">
          </td>
        </tr>`;
      evidenceUpload.setRevealStartState();
      const checkbox = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('block');
      expect(checkbox.checked).to.equal(true);
    });
    it('starts revealed if uploaded errors exist', () => {
      document.querySelector('#files-uploaded tbody').innerHTML =
        `<span id="file-upload-1-error" class="govuk-error-message">some error</span>`;
      evidenceUpload.setRevealStartState();
      const checkbox = document.getElementById(evidenceUpload.CHECKBOX_ID) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('block');
      expect(checkbox.checked).to.equal(true);
    });
  }); */

  describe('upload media file', function () {
    before(function () {
      document.querySelector<HTMLInputElement>(
        `#${evidenceUpload.FILE_UPLOAD_ID}`
      ).addEventListener = sinon.spy();
    });

    describe('initialize class', function () {
      it('should attach Event Listeners', function () {
        const target = document.querySelector<HTMLInputElement>(
          `#${evidenceUpload.FILE_UPLOAD_ID}`
        );
        expect(target.addEventListener).to.have.not.been.called;
        evidenceUpload.init();
        expect(target.addEventListener).to.have.been.called;
      });
    });
  });

  describe('#uploadFile', function () {
    let submitStub: sinon.SinonStub;

    beforeEach(function () {
      submitStub = sinon.stub(HTMLFormElement.prototype, 'submit');
    });

    afterEach(function () {
      submitStub.restore();
    });

    it('creates a form element appended to the body', function () {
      expect(document.forms.length).to.equal(1);
      evidenceUpload.uploadFile();
      expect(document.forms.length).to.equal(2);
      const form = document.forms['js-upload-form'];
      expect(form.action).to.equal('/question/1?_csrf=12323#evidence-upload');
      expect(form.method).to.equal('post');
      expect(form.enctype).to.equal('multipart/form-data');
    });

    it('shows the spinner and hides the file upload', function () {
      evidenceUpload.uploadFile();
      const uploadSpinner = document.getElementById('upload-spinner');
      expect(uploadSpinner.style.display).to.equal('block');
      const uploadFileButton = document.getElementById('uploadFileButton');
      expect(uploadFileButton.style.display).to.equal('none');
    });

    it('submits the form', function () {
      evidenceUpload.uploadFile();
      expect(submitStub).to.have.been.calledOnce;
    });
  });
});
