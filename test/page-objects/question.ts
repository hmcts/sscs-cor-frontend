const { question } = require('app/server/paths');
import { BasePage } from 'test/page-objects/base';
import * as path from 'path';

export class QuestionPage extends BasePage {
  constructor(page, questionOrdinal) {
    super(page);
    this.pagePath = `${question}/${questionOrdinal}`;
  }

  async answer(answer, submit) {
    await this.enterTextintoField('#question-field', answer);
    const buttonId = submit ? '#submit-answer' : '#save-answer';
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement(buttonId)
    ]);
  }

  async saveAnswer(answer) {
    await this.answer(answer, false);
  }

  async submitAnswer(answer) {
    await this.answer(answer, true);
  }

  async getFileList() {
    const elements = await this.page.$$('#files-uploaded tbody tr.evidence');
    return elements;
  }

  async countEvidence(): Promise<number> {
    const elements = await this.getFileList();
    return elements.length;
  }

  async getEvidenceListText(index: number): Promise<string> {
    const elements = await this.page.$$('#files-uploaded tbody tr');
    return elements[index].$eval('td:first-child', el => el.innerText);
  }

  async deleteEvidence() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('input[name="delete"]')
    ]);
  }

  async selectFile(filename: string) {
    const fileInput = await this.getElement('#file-upload-1');
    const filePath = path.join(__dirname, `/../fixtures/evidence/${filename}`);
    await fileInput.uploadFile(filePath);
  }
}
