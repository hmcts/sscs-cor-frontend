import { URL } from 'url';
import { login } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';
import config from 'config';
import { expect } from 'test/chai-sinon';

const idamUrl = config.get('idam.url');
const idamSignInPagePath = '/login';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = login;
  }

  verifyPage() {
    const url = new URL(this.page.url());
    const actual = `${url.protocol}//${url.host}${url.pathname}`;
    const expected = `${idamUrl}${idamSignInPagePath}`;

    expect(
      actual,
      `URL mismatch.\nExpected: ${expected}\nActual:   ${actual}`
    ).to.equal(expected);
  }

  async login(email, password) {
    await this.enterTextintoField('#username', email);
    await this.enterTextintoField('#password', password);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('[type=submit]'),
    ]);
  }
}
