const { question } = require('app/server/paths');
const BasePage = require('test/page-objects/base');

class QuestionPage extends BasePage {
  constructor(page, hearingId, questionId) {
    super(page);
    this.pagePath = `${question}/${hearingId}/${questionId}`;
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
}

module.exports = QuestionPage;
