import { BasePage } from 'test/page-objects/base';
import * as path from 'path';
import { question } from 'app/server/paths';

export class UploadEvidencePage extends BasePage {
  constructor(page, questionOrdinal) {
    super(page);
    this.pagePath = `${question}/${questionOrdinal}/upload-evidence`;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-button button'),
    ]);
  }

  async selectFile(filename: string) {
    const fileInput = await this.getElement('#file-upload-1');
    const filePath = path.join(__dirname, `/../fixtures/evidence/${filename}`);
    await fileInput.uploadFile(filePath);
  }
}
