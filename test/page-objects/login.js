const { login } = require('app/server/paths');
const BasePage = require('test/page-objects/base');

class QuestionPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = login;
  }

  async login(email) {
    await this.enterTextintoField('#email-address', email);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#login')
    ]);
  }
}

module.exports = QuestionPage;
