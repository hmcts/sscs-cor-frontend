export class EvidenceUploadHelper {
  public revealContainer: HTMLElement;
  public FILE_UPLOAD_ID: string = 'file-upload-1';
  public FILE_UPLOAD_LABEL_SELECTOR: string = '[for="file-upload-1"]';
  public CHECKBOX_ID: string = 'provide-evidence-1';

  showHideRevealContainer(e: any): void {
    const checkbox = e.target as HTMLInputElement;
    if (checkbox.checked) {
      this.revealContainer.style.display = 'block';
    } else {
      this.revealContainer.style.display = 'none';
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

  showHideElements(noJsElementSelector: string, jsElementSelector: string): void {
    const noJsElements: NodeListOf<HTMLElement> = document.querySelectorAll(noJsElementSelector);
    const jsElements: NodeListOf<HTMLElement> = document.querySelectorAll(jsElementSelector);
    Array.from(noJsElements).forEach(e => e.style.display = 'none');
    Array.from(jsElements).forEach(e => e.style.display = 'block');
  }
}
