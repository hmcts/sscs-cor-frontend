const { question } = require('paths');
const BasePage = require('test/page-objects/base');

class QuestionPage extends BasePage {
  constructor(page, hearingId, questionId) {
    super(page);
    this.page = page;
    this.pagePath = `${question}/${hearingId}/${questionId}`;
  }

  async saveAnswer(answer) {
    await this.screenshot('beforeEnteringText');
    await this.enterTextintoField('#question-field', answer);
    await this.screenshot('afterEnteringText');
    await Promise.all([
      this.page.waitForNavigation(),
      this.screenshot('beforeClickingSave'),
      this.clickElement('#save-answer'),
      this.screenshot('afterClickingSave')
    ]);
  }
}

module.exports = QuestionPage;
