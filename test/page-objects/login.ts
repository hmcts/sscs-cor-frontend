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

  async oldSignInFlow(email, password) {
    await this.enterTextintoField('#username', email);
    await this.enterTextintoField('#password', password);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('[type=submit]'),
    ]);
  }

  async isNewLoginPresent(): Promise<boolean> {
    return this.page
      .waitForSelector('a[href="/enter-email"]', { timeout: 10000 })
      .then(() => true)
      .catch((error) => {
        console.log(
          `isNewLoginPresent: link not found on ${this.page.url()}. Reason: ${error.message}`
        );
        return false;
      });
  }

  async newSignInFlow(email: string, password: string) {
    const continueButton =
      '#main-content > div > div > form > div.govuk-button-group > button';

    await this.clickElement('a[href="/enter-email"]');
    await this.page.waitForSelector('#email', { visible: true });
    await this.enterTextintoField('#email', email);
    await this.clickElement(continueButton);
    await this.page.waitForSelector('#password', {
      visible: true,
      timeout: 5000,
    });
    await this.enterTextintoField('#password', password);
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement(continueButton),
    ]);
  }

  async loginJourney(email: string, password: string) {
    let newLoginPresent = false;
    newLoginPresent = await this.isNewLoginPresent();
    console.log('signIn: newLoginPresent=', newLoginPresent);

    if (newLoginPresent) {
      await this.newSignInFlow(email, password);
    } else {
      await this.oldSignInFlow(email, password);
    }
  }
}
