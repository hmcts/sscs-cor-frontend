import { login, dummyLogin } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';
const config = require('config');

const enableDummyLogin: boolean = config.get('enableDummyLogin') === 'true';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = (enableDummyLogin) ? dummyLogin : login;
  }

  async login(email) {
    await this.enterTextintoField('#username', email);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('[type=submit]')
    ]);
  }
}