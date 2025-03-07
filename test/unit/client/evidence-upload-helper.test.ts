import { expect, sinon } from 'test/chai-sinon';
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

describe('evidence-upload-helper', function () {
  let evidenceUploadHelper: EvidenceUploadHelper;
  let body;

  before(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
    evidenceUploadHelper = new EvidenceUploadHelper();
  });

  describe('#showHideElements', function () {
    it('hide no-JS and JS elements', function () {
      const noJsElements: NodeListOf<HTMLElement> = body.querySelectorAll(
        '.evidence-upload-nojs'
      );
      const jsElements: NodeListOf<HTMLElement> = body.querySelectorAll(
        '.evidence-upload-js'
      );
      evidenceUploadHelper.showHideElements(
        '.evidence-upload-nojs',
        '.evidence-upload-js'
      );
      noJsElements.forEach((e) => expect(e.style.display).to.equal('none'));
      jsElements.forEach((e) => expect(e.style.display).to.equal('block'));
    });
  });

  describe('#showHideRevealContainer', function () {
    let revealContainer: HTMLElement;

    before(function () {
      revealContainer = document.getElementById(
        'evidence-upload-reveal-container'
      );
      evidenceUploadHelper.revealContainer = revealContainer;
    });

    it('hides if checkbox is not checked', function () {
      const target = document.getElementById(
        evidenceUploadHelper.CHECKBOX_ID
      ) as HTMLInputElement;
      target.checked = false;
      evidenceUploadHelper.showHideRevealContainer({ target });
      expect(revealContainer.style.display).to.equal('none');
    });

    it('shows if checkbox is checked', function () {
      const target = document.getElementById(
        evidenceUploadHelper.CHECKBOX_ID
      ) as HTMLInputElement;
      target.checked = true;
      evidenceUploadHelper.showHideRevealContainer({ target });
      expect(revealContainer.style.display).to.equal('block');
    });
  });

  describe('#setRevealStartState', function () {
    let revealContainer: HTMLElement;

    before(function () {
      revealContainer = document.getElementById(
        'evidence-upload-reveal-container'
      );
    });

    it('starts hidden if no uploaded files exist and no upload errors', function () {
      evidenceUploadHelper.setRevealStartState();
      const checkbox = document.getElementById(
        evidenceUploadHelper.CHECKBOX_ID
      ) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('none');
      expect(checkbox.checked).to.equal(false);
    });

    it('starts revealed if uploaded files exist', function () {
      document.querySelector('#files-uploaded tbody').innerHTML = `
        <tr class="govuk-table__row evidence">
          <td class="govuk-table__cell">My file.png</td>
          <td class="govuk-table__cell">
            <input type="hidden" name="id" value="147e9118-24bc-4e33-9586-053c341469f8">
            <input type="submit" name="delete" value="Delete" class="govuk-link">
          </td>
        </tr>`;
      evidenceUploadHelper.setRevealStartState();
      const checkbox = document.getElementById(
        evidenceUploadHelper.CHECKBOX_ID
      ) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('block');
      expect(checkbox.checked).to.equal(true);
    });

    it('starts revealed if uploaded errors exist', function () {
      document.querySelector(
        '#files-uploaded tbody'
      ).innerHTML = `<span id="file-upload-1-error" class="govuk-error-message">some error</span>`;
      evidenceUploadHelper.setRevealStartState();
      const checkbox = document.getElementById(
        evidenceUploadHelper.CHECKBOX_ID
      ) as HTMLInputElement;
      expect(revealContainer.style.display).to.equal('block');
      expect(checkbox.checked).to.equal(true);
    });
  });
});
