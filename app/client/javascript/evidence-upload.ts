export class EvidenceUpload {
  public NOJS_ELEMENT_CLASS: string = '.evidence-upload-nojs';
  public JS_ELEMENT_CLASS: string = '.evidence-upload-js';
  public CHECKBOX_ID: string = 'provide-evidence-1';
  public FILE_UPLOAD: string = 'file-upload-1';
  public FILE_UPLOAD_LABEL: string = '[for="file-upload-1"]';
  public REVEAL_CONTAINER: string = 'evidence-upload-reveal-container';
  private revealContainer: HTMLElement;

  constructor() {
    this.revealContainer = document.getElementById(this.REVEAL_CONTAINER);
    this.showHideElements();
    this.setRevealStartState();
    this.setFileUploadState();
    this.attachEventListeners();
  }

  showHideRevealContainer(e: any): void {
    const checkbox = e.target as HTMLInputElement;
    if (checkbox.checked) {
      this.revealContainer.style.display = 'block';
    } else {
      this.revealContainer.style.display = 'none';
    }
  }

  attachEventListeners(): void {
    const provideEvidence: HTMLElement = document.getElementById(this.CHECKBOX_ID);
    provideEvidence.addEventListener('click', this.showHideRevealContainer.bind(this));
  }

  setFileUploadState(): void {
    document.getElementById(this.FILE_UPLOAD).style.display = 'none';
    const fileUploadLabel: HTMLElement = document.querySelector(this.FILE_UPLOAD_LABEL);
    fileUploadLabel.style.display = '';
    fileUploadLabel.className = 'govuk-button secondary-button';
  }

  setRevealStartState(): void {
    const uploadedFiles = document.querySelectorAll('#files-uploaded tr.evidence');
    const provideEvidence = document.getElementById(this.CHECKBOX_ID) as HTMLInputElement;
    if (uploadedFiles.length === 0) {
      provideEvidence.checked = false;
      this.revealContainer.style.display = 'none';
    } else {
      provideEvidence.checked = true;
      this.revealContainer.style.display = 'block';
    }
    this.revealContainer.className = 'panel-indent';
  }

  showHideElements(): void {
    const noJsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.NOJS_ELEMENT_CLASS);
    const jsElements: NodeListOf<HTMLElement> = document.querySelectorAll(this.JS_ELEMENT_CLASS);
    noJsElements.forEach(e => e.style.display = 'none');
    jsElements.forEach(e => e.style.display = 'block');
  }
}
