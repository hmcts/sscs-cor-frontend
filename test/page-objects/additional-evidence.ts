import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';

export class AdditionalEvidencePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = additionalEvidence;
  }

  async selectStatementOption() {
    await this.clickElement('#additional-evidence-option');
  }

  async selectUploadOption() {
    await this.clickElement('#additional-evidence-option-2');
  }

  async selectPostOption() {
    await this.clickElement('#additional-evidence-option-3');
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-buttons button')
    ]);
  }
}
