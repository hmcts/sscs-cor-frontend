import { login } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class LoginPage extends BasePage {
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