const { question } = require('app/server/paths');
const BasePage = require('test/page-objects/base');

class QuestionPage extends BasePage {
  constructor(page, hearingId, questionId) {
    super(page);
    this.pagePath = `${question}/${hearingId}/${questionId}`;
  }

  async saveAnswer(answer) {
    await this.enterTextintoField('#question-field', answer);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#save-answer')
    ]);
  }

  async submitAnswer(answer) {
    await this.enterTextintoField('#question-field', answer);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-answer')
    ]);
  }
}

module.exports = QuestionPage;
