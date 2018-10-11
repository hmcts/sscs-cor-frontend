import { URL } from 'url';
import { login, dummyLogin } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';
const config = require('config');
const { expect } = require('test/chai-sinon');

const enableDummyLogin: boolean = config.get('enableDummyLogin') === 'true';
const idamUrl = config.get('idam.url');
const idamSignInPagePath = '/login';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = (enableDummyLogin) ? dummyLogin : login;
  }

  verifyPage() {
    const url = new URL(this.page.url());
    expect(`${url.protocol}//${url.host}${url.pathname}`).to.equal(`${idamUrl}${idamSignInPagePath}`);
  }

  async login(email) {
    await this.enterTextintoField('#username', email);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('[type=submit]')
    ]);
  }
}