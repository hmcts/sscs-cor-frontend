import { EvidenceUploadHelper } from './evidence-upload-helper';
export class EvidenceUploadAudioVideo {
  public NOJS_ELEMENT_SELECTOR: string = '.evidence-upload-audio-video-nojs';
  public JS_ELEMENT_SELECTOR: string = '.evidence-upload-audio-video-js';
  public CHECKBOX_ID: string = 'provide-evidence-1';
  public FILE_UPLOAD_ID: string = 'file-upload-1';
  public FILE_UPLOAD_LABEL_SELECTOR: string = '[for="file-upload-1"]';
  public REVEAL_CONTAINER_ID: string = 'evidence-upload-audio-video-reveal-container';
  private revealContainer: HTMLElement;
  public answerFormElement: HTMLElement = null;
  public modal: HTMLElement = null;
  public extend: HTMLElement = null;
  public cancel: HTMLElement = null;
  public ANSWER_FORM: string = 'answer-form';
  public EXTEND_BUTTON: string = 'stay';
  public CANCEL_BUTTON: string = 'leave';
  public MODAL: string = 'file-dialog';
  public keyStrokeEventListener: any;
  public SUBMIT_BUTTON: string = 'submit-evidences';
  private evidenceUploadHelper: EvidenceUploadHelper;
  constructor() {
    this.init();
  }

  init() {
    this.evidenceUploadHelper = new EvidenceUploadHelper();
    if (document.getElementById('evidence-upload-audio-video')) {
      this.revealContainer = document.getElementById(this.REVEAL_CONTAINER_ID);
      this.evidenceUploadHelper.revealContainer = this.revealContainer;
      this.evidenceUploadHelper.showHideElements(this.NOJS_ELEMENT_SELECTOR, this.JS_ELEMENT_SELECTOR);
      this.evidenceUploadHelper.setRevealStartState();
      this.evidenceUploadHelper.setFileUploadState();
      this.attachEventListeners();
    }
    this.answerFormElement = document.getElementById(this.ANSWER_FORM);
    this.keyStrokeEventListener = this.stayOnPage.bind(this);

    this.modal = document.getElementById(this.MODAL);
    this.extend = document.getElementById(this.EXTEND_BUTTON);
    this.cancel = document.getElementById(this.CANCEL_BUTTON);
    this.additionalEvidenceAttachEventListeners();
    this.submitEvidenceEventListener();
  }

  uploadFile(): void {
    const formAction: string = document.forms['answer-form'].action + '#evidence-upload-audio-video';
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

  stayOnPage(): void {
    if (this.modal) {
      this.modal.classList.remove('modal--open');
    }
    this.removeKeyStrokeListener();
    this.removeModalButtonListeners();
  }

  stopSignOut(event: any): void {
    if (document.getElementById('selected-evidence-file').textContent) {
      event.stopPropagation();
      event.preventDefault();
      if (this.modal) {
        this.modal.classList.add('modal--open');
      }
      this.bindModalButtonListeners();
      this.bindKeyStrokeListener();
    }
  }

  signOut() {
    window.location.assign('/sign-out');
  }

  attachEventListeners(): void {
    const provideEvidence: HTMLElement = document.getElementById(this.CHECKBOX_ID);
    provideEvidence.addEventListener('click', this.evidenceUploadHelper.showHideRevealContainer.bind(this));
    const fileUpload: HTMLElement = document.getElementById(this.FILE_UPLOAD_ID);
    fileUpload.addEventListener('change', this.uploadFile.bind(this));
  }

  submitEvidenceEventListener(): void {
    const submitEvidence: HTMLElement = document.getElementById(this.SUBMIT_BUTTON);

    if (submitEvidence != null) {
      submitEvidence.addEventListener('click', this.submitPage.bind(this));
    }
  }

  submitPage(): void {
    const submitEvidence: HTMLElement = document.getElementById(this.SUBMIT_BUTTON);
    submitEvidence.style.display = 'none';
    const submitSpinner = document.getElementById('upload-spinner');
    submitSpinner.style.display = 'block';
  }

  additionalEvidenceAttachEventListeners(): void {
    const signOut = document.querySelector('#sign-out');
    if (signOut) {
      signOut.addEventListener('click', this.stopSignOut.bind(this));
    }

    const headerSignOut = document.querySelector('#header-sign-out');
    if (headerSignOut) {
      headerSignOut.addEventListener('click', this.stopSignOut.bind(this));
    }

    const additionalEvidence = document.querySelector('#additional-evidence-audio-video-file');
    if (additionalEvidence) {
      additionalEvidence.addEventListener('change', (input: any) => {
        const selectedFile: HTMLElement = document.getElementById('selected-evidence-file');
        const noSelectedFile: HTMLElement = document.getElementById('no-evidence-file');
        if (input.currentTarget.files && input.currentTarget.files.length >= 1) {
          const fileName = input.currentTarget.files[0].name;
          selectedFile.innerText = fileName;
          noSelectedFile.style.display = 'none';
          const contentWarningPara: HTMLElement = document.getElementById('av-content-warning');
          if (fileName.toLowerCase().endsWith('.mp3') || fileName.toLowerCase().endsWith('.mp4')) {
            contentWarningPara.style.display = 'block';
          } else {
            contentWarningPara.style.display = 'none';
          }
        } else {
          selectedFile.innerText = '';
          noSelectedFile.style.display = 'block';
        }
      });
    }
  }

  bindModalButtonListeners() {
    if (this.modal && this.extend) this.extend.addEventListener('click', this.keyStrokeEventListener);
    if (this.modal && this.cancel) this.cancel.addEventListener('click', this.signOut);
  }

  removeModalButtonListeners() {
    if (this.modal && this.extend) this.extend.removeEventListener('click', this.keyStrokeEventListener);
    if (this.modal && this.cancel) this.cancel.removeEventListener('click', this.stayOnPage);
  }

  bindKeyStrokeListener(): void {
    if (this.modal && this.answerFormElement) this.answerFormElement.addEventListener('keydown', this.keyStrokeEventListener);
  }

  removeKeyStrokeListener(): void {
    if (this.modal && this.answerFormElement) this.answerFormElement.removeEventListener('keydown', this.keyStrokeEventListener);
  }
}
