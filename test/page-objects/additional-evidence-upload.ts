import * as path from 'path';

import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';
import { ElementHandle } from 'puppeteer';

export class AdditionalEvidenceUploadPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/upload`;
  }

  async verifyPages() {
    const title = this.page.title();
    expect(title).to.equal(content.en.additionalEvidence.evidenceUpload.header);
  }

  async selectFile(filename: string) {
    const fileInput = (await this.page.$(
      '#additional-evidence-file'
    )) as ElementHandle<HTMLInputElement>;
    const filePath = path.join(__dirname, `/../fixtures/evidence/${filename}`);
    await fileInput.uploadFile(filePath);
  }

  async addDescription(statement: string) {
    await this.setTextintoField('#additional-evidence-description', statement);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-evidences'),
    ]);
  }
}
