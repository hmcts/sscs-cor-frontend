import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';

export class AdditionalEvidenceStatementPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/statement`;
  }

  async addStatement(statement: string) {
    await this.setTextintoField('#question-field', statement);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-statement'),
    ]);
  }
}
