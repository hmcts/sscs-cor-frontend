const { question } = require('app/server/paths');
import { BasePage } from 'test/page-objects/base';

export class SubmitQuestionPage extends BasePage {
  constructor(page, questionOrdinal) {
    super(page);
    this.pagePath = `${question}/${questionOrdinal}/submit`;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-answer')
    ]);
  }
}