import * as path from 'path';
const { expect } = require('test/chai-sinon');
import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
const content = require('locale/content');

export class AdditionalEvidenceUploadPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/upload`;
  }

  async verifyPages() {
    const headerText = this.page.getHeading();
    expect(headerText).to.equal(content.en.additionalEvidence.evidenceUpload.header);
  }

  async selectFile(filename: string) {
    const fileInput = await this.getElement('#additional-evidence-file');
    const filePath = path.join(__dirname, `/../fixtures/evidence/${filename}`);
    await fileInput.uploadFile(filePath);
  }

  async addDescription(statement: string) {
    await this.setTextintoField('#additional-evidence-description', statement);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-evidences')
    ]);
  }
}
