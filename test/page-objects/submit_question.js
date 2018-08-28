const { question } = require('paths');
const BasePage = require('test/page-objects/base');

class SubmitQuestionPage extends BasePage {
  constructor(page, hearingId, questionId) {
    super(page);
    this.page = page;
    this.pagePath = `${question}/${hearingId}/${questionId}/submit`;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-answer')
    ]);
  }
}

module.exports = SubmitQuestionPage;
