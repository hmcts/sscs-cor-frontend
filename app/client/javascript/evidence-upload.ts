export class EvidenceUpload {
  public NOJS_ELEMENT_SELECTOR: string = '.evidence-upload-nojs';
  public JS_ELEMENT_SELECTOR: string = '.evidence-upload-js';
  public CHECKBOX_ID: string = 'provide-evidence-1';
  public FILE_UPLOAD_ID: string = 'file-upload-1';
  public FILE_UPLOAD_LABEL_SELECTOR: string = '[for="file-upload-1"]';
  public REVEAL_CONTAINER_ID: string = 'evidence-upload-reveal-container';
  private revealContainer: HTMLElement;

  constructor() {
    this.init();
  }

  init() {
    if (document.getElementById('evidence-upload')) {
      this.revealContainer = document.getElementById(this.REVEAL_CONTAINER_ID);
      this.showHideElements();
      this.setRevealStartState();
      this.setFileUploadState();
      this.attachEventListeners();
    }
  }

  showHideRevealContainer(e: any): void {
    const checkbox = e.target as HTMLInputElement;
    if (checkbox.checked) {
      this.revealContainer.style.display = 'block';
    } else {
      this.revealContainer.style.display = 'none';
    }
  }

  uploadFile(): void {
    const formAction: string = document.forms['answer-form'].action + '#evidence-upload';
    const formElement = document.createElement('form');
    formElement.setAttribute('id', 'js-upload-form');
    formElement.setAttribute('action', formAction);
    formElement.setAttribute('method', 'post');
    formElement.appendChild(document.getElementById('question-field'));
    formElement.appendChild(document.getElementById(this.FILE_UPLOAD_ID));
    formElement.setAttribute('enctype', 'multipart/form-data');
    document.getElementById('answer-form').prepend(formElement);

    const spinner = document.getElementById('upload-spinner');
    spinner.style.display = 'block';
    const fileUpload = document.getElementById('uploadFileButton');
    fileUpload.style.display = 'none';

    document.forms['js-upload-form'].submit();
  }

  attachEventListeners(): void {
    const provideEvidence: HTMLElement = document.getElementById(this.CHECKBOX_ID);
    provideEvidence.addEventListener('click', this.showHideRevealContainer.bind(this));
    const fileUpload: HTMLElement = document.getElementById(this.FILE_UPLOAD_ID);
    fileUpload.addEventListener('change', this.uploadFile.bind(this));
  }

  setFileUploadState(): void {
    document.getElementById(this.FILE_UPLOAD_ID).style.display = 'none';
    const fileUploadLabel: HTMLElement = document.querySelector(this.FILE_UPLOAD_LABEL_SELECTOR);
    fileUploadLabel.style.display = '';
    fileUploadLabel.className = 'govuk-button secondary-button';
  }

  setRevealStartState(): void {
    const uploadedFiles = document.querySelectorAll('#files-uploaded tr.evidence');
    const uploadError = document.querySelectorAll('#file-upload-1-error');
    const provideEvidence = document.getElementById(this.CHECKBOX_ID) as HTMLInputElement;
    if (uploadedFiles.length === 0 && uploadError.length === 0) {
      provideEvidence.checked = false;
      this.revealContainer.style.display = 'none';
    } else {
      provideEvidence.checked = true;
      this.revealContainer.style.display = 'block';
    }
    this.revealContainer.className = 'panel-indent';
  }

  showHideElements(): void {
    const noJsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.NOJS_ELEMENT_SELECTOR);
    const jsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.JS_ELEMENT_SELECTOR);
    noJsElements.forEach(e => e.style.display = 'none');
    jsElements.forEach(e => e.style.display = 'block');
  }
}
