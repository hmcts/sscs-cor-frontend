const { question } = require('app/server/paths');
import { BasePage } from 'test/page-objects/base';

export class UploadEvidencePage extends BasePage {
  constructor(page, questionOrdinal) {
    super(page);
    this.pagePath = `${question}/${questionOrdinal}/upload-evidence`;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-button button')
    ]);
  }
}
