import { EvidenceUploadHelper } from './evidence-upload-helper';
export class EvidenceUpload {
  public NOJS_ELEMENT_SELECTOR = '.evidence-upload-nojs';
  public JS_ELEMENT_SELECTOR = '.evidence-upload-js';
  public CHECKBOX_ID = 'provide-evidence-1';
  public FILE_UPLOAD_ID = 'file-upload-1';
  public FILE_UPLOAD_LABEL_SELECTOR = '[for="file-upload-1"]';
  public REVEAL_CONTAINER_ID = 'evidence-upload-reveal-container';
  public revealContainer: HTMLElement;
  public evidenceUploadHelper: EvidenceUploadHelper;

  constructor() {
    this.init();
  }

  init() {
    this.evidenceUploadHelper = new EvidenceUploadHelper();
    if (document.getElementById('evidence-upload')) {
      this.revealContainer = document.getElementById(this.REVEAL_CONTAINER_ID);
      this.evidenceUploadHelper.revealContainer = this.revealContainer;
      this.evidenceUploadHelper.showHideElements(
        this.NOJS_ELEMENT_SELECTOR,
        this.JS_ELEMENT_SELECTOR
      );
      this.evidenceUploadHelper.setRevealStartState();
      this.evidenceUploadHelper.setFileUploadState();
      this.attachEventListeners();
    }
    this.additionalEvidenceAttachEventListeners();
  }

  uploadFile(): void {
    const formAction = `${document.forms['answer-form'].action}#evidence-upload`;
    const formElement = document.createElement('form');
    formElement.setAttribute('id', 'js-upload-form');
    formElement.setAttribute('action', formAction);
    formElement.setAttribute('method', 'post');
    formElement.appendChild(document.getElementById('question-field'));
    formElement.appendChild(document.getElementById(this.FILE_UPLOAD_ID));
    formElement.setAttribute('enctype', 'multipart/form-data');
    const answerForm: HTMLFormElement = document.getElementById(
      'answer-form'
    ) as HTMLFormElement;
    answerForm.prepend(formElement);

    const spinner = document.getElementById('upload-spinner');
    spinner.style.display = 'block';
    const fileUpload = document.getElementById('uploadFileButton');
    fileUpload.style.display = 'none';

    document.forms['js-upload-form'].submit();
  }

  attachEventListeners(): void {
    const provideEvidence: HTMLElement = document.getElementById(
      this.CHECKBOX_ID
    );
    provideEvidence.addEventListener(
      'click',
      this.evidenceUploadHelper.showHideRevealContainer.bind(this)
    );
    const fileUpload: HTMLElement = document.getElementById(
      this.FILE_UPLOAD_ID
    );
    fileUpload.addEventListener('change', this.uploadFile.bind(this));
  }

  additionalEvidenceAttachEventListeners(): void {
    const additionalEvidence = document.querySelector(
      '#additional-evidence-file'
    );
    if (additionalEvidence) {
      additionalEvidence.addEventListener('change', (input: any) => {
        const spinner = document.getElementById('upload-spinner');
        spinner.style.display = 'block';
        const fileUpload: HTMLElement = document.querySelector(
          '[for="additional-evidence-file"]'
        );
        fileUpload.style.display = 'none';

        document.forms['additional-evidence-form'].submit();
      });
    }
  }
}
