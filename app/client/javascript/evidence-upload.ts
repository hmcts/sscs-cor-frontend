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
    this.additionalEvidenceAttachEventListeners();
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
    const answerForm: HTMLFormElement = document.getElementById('answer-form') as HTMLFormElement;
    answerForm.prepend(formElement);

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

  additionalEvidenceAttachEventListeners(): void {
    const additionalEvidence = document.querySelector('#additional-evidence-file');
    if (additionalEvidence) {
      additionalEvidence.addEventListener('change', (input: any) => {
        if (input.currentTarget.files && input.currentTarget.files.length >= 1) {
          const fileName = input.currentTarget.files[0].name;
          const contentWarningPara: HTMLElement = document.getElementById('av-content-warning');
          if (fileName.toLowerCase().endsWith('.mp3') || fileName.toLowerCase().endsWith('.mp4')) {
            contentWarningPara.style.display = 'block';
          } else {
            contentWarningPara.style.display = 'none';
          }
        }
      });
    }
  }

  setFileUploadState(): void {
    document.getElementById(this.FILE_UPLOAD_ID).className = 'file-display-none';
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
  }

  showHideElements(): void {
    const noJsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.NOJS_ELEMENT_SELECTOR);
    const jsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.JS_ELEMENT_SELECTOR);
    Array.from(noJsElements).forEach(e => e.style.display = 'none');
    Array.from(jsElements).forEach(e => e.style.display = 'block');
  }
}
