export class EvidenceStatement {
  public SUBMIT_STATEMENT_BUTTON = 'submit-statement';

  constructor() {
    this.init();
  }

  init() {
    this.submitStatementEventListener();
  }

  submitStatementEventListener(): void {
    const submitStatement: HTMLElement = document.getElementById(
      this.SUBMIT_STATEMENT_BUTTON
    );

    if (submitStatement !== null) {
      submitStatement.addEventListener(
        'click',
        this.submitStatementPage.bind(this)
      );
    }
  }

  submitStatementPage(): void {
    const submitEvidence: HTMLElement = document.getElementById(
      this.SUBMIT_STATEMENT_BUTTON
    );
    submitEvidence.style.display = 'none';
    const submitSpinner = document.getElementById('upload-spinner');
    submitSpinner.style.display = 'block';
  }
}
