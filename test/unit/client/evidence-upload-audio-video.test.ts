import { expect, sinon } from 'test/chai-sinon';
import { EvidenceUploadAudioVideo } from 'app/client/javascript/evidence-upload-audio-video';
import { stub } from 'sinon';
import { EvidenceUploadHelper } from 'app/client/javascript/evidence-upload-helper';

const html = `<form id="answer-form" action="/question/1?_csrf=12323" method="post">
    <input type="text" id="question-field" name="question-field"/>
</form>
<a class="govuk-header__link govuk-header__link--signout" id="header-sign-out" href="/sign-out"></a>
<a class="sign-out" id="sign-out" href="/sign-out"></a>
<div id="evidence-upload-audio-video">
<div class="govuk-form-group">
  <div class="govuk-checkboxes evidence-upload-audio-video-js" style="display: block;">
    <div class="govuk-checkboxes__item">
      <input class="govuk-checkboxes__input" id="provide-evidence-1" name="provide-evidence" type="checkbox" value="yes">
      <label class="govuk-label govuk-checkboxes__label" for="provide-evidence-1">
        I want to provide evidence to support my answer
      </label>
    </div>
  </div>
</div>
      <div id="evidence-upload-audio-video-reveal-container" class="govuk-details__text --margin-bottom-m" style="display: block;">
        <h2 class="govuk-heading-m evidence-upload-audio-video-nojs" style="display: none;">Provide evidence to support your answer</h2>
        <p>You can upload evidence to support your answer such as letters, photos, video or audio. If you are taking a picture of a letter, place it on a flat surface and take the picture from above.</p>
<div class="govuk-form-group">
  <label class="govuk-button secondary-button" for="file-upload-1" style="">
    Choose file
  </label>
  <input class="govuk-file-upload evidence-upload-audio-video-js" id="file-upload-1" name="file-upload-1" type="file" accept=".mp3, .mp4" style="display: none;">
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
        <input id="add-file" name="add-file" type="submit" value="Add file" class="govuk-button secondary-button evidence-upload-audio-video-nojs" style="display: none;">
    </div>
    <div id="upload-spinner"></div>
     <input id="submit-evidences">
     <div id="av-content-warning" style="display: none"></div>
     <p id="additional-evidence-audio-video-file"></p>
     <p id="selected-evidence-file"></p>
     <p id="no-evidence-file"></p>
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

describe('evidence-upload-audio-video', function () {
  let evidenceUpload;
  let body;

  before(function () {
    body = document.querySelector('body');
    body.innerHTML = html;
    evidenceUpload = new EvidenceUploadAudioVideo();
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

  describe('#showSpinnerOnSubmitEvidenceClick', function () {
    it('hides submit evidence button when clicked', function () {
      const submitSpinner = document.getElementById('upload-spinner');
      const submitEvidence: HTMLElement =
        document.getElementById('submit-evidences');
      evidenceUpload.submitEvidenceEventListener();
      submitEvidence.click();
      expect(submitSpinner.style.display).to.equal('block');
      expect(submitEvidence.style.display).to.equal('none');
    });
  });

  describe('#additionalEvidenceAttachEventListeners', function () {
    let submitStub: sinon.SinonStub;
    let additionalEvidence: HTMLElement;
    let selectedFile: HTMLElement;
    let noSelectedFile: HTMLElement;
    let contentWarningPara: HTMLElement;

    beforeEach(function () {
      additionalEvidence = document.querySelector<HTMLInputElement>(
        `#additional-evidence-audio-video-file`
      );
      selectedFile = document.getElementById('selected-evidence-file');
      noSelectedFile = document.getElementById('no-evidence-file');
      contentWarningPara = document.getElementById('av-content-warning');
    });

    afterEach(function () {
      submitStub.restore();
    });

    it('set files array with audio files', function () {
      const input = {
        currentTarget: {
          files: [{ name: 'file1.mp3' }, { name: 'file2.mp3' }],
        },
      };
      submitStub = stub(additionalEvidence, 'addEventListener').callsArgWith(
        1,
        input
      );
      evidenceUpload.additionalEvidenceAttachEventListeners();
      expect(selectedFile.innerText).to.equal('file1.mp3');
      expect(noSelectedFile.style.display).to.equal('none');
      expect(contentWarningPara.style.display).to.equal('block');
    });

    it('set files array with video files', function () {
      const input = {
        currentTarget: {
          files: [{ name: 'file1.mp4' }, { name: 'file2.mp4' }],
        },
      };
      submitStub = stub(additionalEvidence, 'addEventListener').callsArgWith(
        1,
        input
      );
      evidenceUpload.additionalEvidenceAttachEventListeners();
      expect(selectedFile.innerText).to.equal('file1.mp4');
      expect(noSelectedFile.style.display).to.equal('none');
      expect(contentWarningPara.style.display).to.equal('block');
    });

    it('set files array with no audio or video files', function () {
      const input = {
        currentTarget: {
          files: [{ name: 'file1.txt' }, { name: 'file2.txt' }],
        },
      };
      submitStub = stub(additionalEvidence, 'addEventListener').callsArgWith(
        1,
        input
      );
      evidenceUpload.additionalEvidenceAttachEventListeners();
      expect(selectedFile.innerText).to.equal('file1.txt');
      expect(noSelectedFile.style.display).to.equal('none');
      expect(contentWarningPara.style.display).to.equal('none');
    });

    it('set empty files array', function () {
      const input = { currentTarget: { files: [] } };
      submitStub = stub(additionalEvidence, 'addEventListener').callsArgWith(
        1,
        input
      );
      evidenceUpload.additionalEvidenceAttachEventListeners();
      expect(selectedFile.innerText).to.equal('');
      expect(noSelectedFile.style.display).to.equal('block');
    });
  });

  describe('upload media file', function () {
    let selectedEvidenceFile: HTMLElement;
    let noEvidenceFile: HTMLElement;

    before(function () {
      document.querySelector<HTMLInputElement>(
        `#${evidenceUpload.FILE_UPLOAD_ID}`
      ).addEventListener = sinon.spy();
      document.querySelector<HTMLInputElement>(
        `#header-sign-out`
      ).addEventListener = sinon.spy();
      document.querySelector<HTMLInputElement>(`#sign-out`).addEventListener =
        sinon.spy();
      document.querySelector<HTMLInputElement>(
        `#additional-evidence-audio-video-file`
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

      it('should attach Event Listeners to stop sign out', function () {
        const target = document.querySelector<HTMLInputElement>(`#sign-out`);
        evidenceUpload.init();
        expect(target.addEventListener).to.have.been.called;
      });

      it('should attach Event Listeners to stop header sign out', function () {
        const target =
          document.querySelector<HTMLInputElement>(`#header-sign-out`);
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
      expect(form.action).to.equal(
        '/question/1?_csrf=12323#evidence-upload-audio-video'
      );
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
