const { expect } = require('test/chai-sinon');
import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
const i18n = require('locale/en');

export class AdditionalEvidenceUploadPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/upload`;
  }

  async verifyPages() {
    const headerText = this.page.getHeading();
    expect(headerText).to.equal(i18n.additionalEvidence.evidenceUpload.header);
  }

  async addStatement(statement: string) {
    await this.setTextintoField('#question-field', statement);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-statement')
    ]);
  }
}
