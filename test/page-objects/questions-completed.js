const { completed } = require('app/server/paths');
const BasePage = require('test/page-objects/base');

class QuestionsCompletedPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = completed;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-answer')
    ]);
  }
}

module.exports = QuestionsCompletedPage;
