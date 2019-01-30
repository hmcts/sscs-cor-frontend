const { expect } = require('test/chai-sinon');
const config = require('config');

const testUrl = config.get('testUrl');

export class BasePage {

  public page: any;
  public pagePath: string;

  constructor(page) {
    this.page = page;
    this.page.setDefaultNavigationTimeout(90000);
    this.pagePath = '/';
  }

  async visitPage() {
    console.log(`goto [${testUrl}${this.pagePath}]`);
    await this.page.goto(`${testUrl}${this.pagePath}`);
    await this.page.waitForSelector('body');
  }

  verifyPage() {
    expect(this.page.url()).to.equal(`${testUrl}${this.pagePath}`);
  }

  getCurrentUrl() {
    const url = this.page.url();
    return url;
  }

  async getHeading() {
    const heading = await this.page.$eval('h1', el => el.innerHTML);
    return heading;
  }

  async getBody() {
    const body = await this.page.$eval('body', el => el.innerHTML);
    return body;
  }

  async getElementText(selector) {
    await this.page.waitForSelector(selector);
    const element = await this.page.$eval(selector, el => el.innerText);
    return element;
  }

  async getElementValue(selector) {
    const element = await this.page.$eval(selector, el => el.value);
    return element;
  }

  async getElement(selector) {
    const element = await this.page.$(selector);
    return element;
  }

  async getElements(selector) {
    const elements = await this.page.$$(selector);
    return elements;
  }

  async setTextintoField(selector, text) {
    await this.page.evaluate((data) => {
      return document.querySelector(data.selector).value = data.text;
    }, { selector, text });
  }

  async enterTextintoField(selector, text) {
    await this.page.$eval(selector, el => {
      el.value = '';
    });
    await this.page.type(selector, text);
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async screenshot(filename) {
    await this.page.screenshot({
      fullPage: true,
      path: `functional-output/functional-screenshots/${filename}.png`
    });
  }

  async signOut() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('.govuk-header__link--signout')
    ]);
  }

  async deleteCookie(name: string) {
    await this.page.deleteCookie({
      url: testUrl,
      name
    });
  }

  async setCookie(name: string, value: string) {
    await this.page.setCookie({
      value,
      name,
      url: testUrl,
      expires: Date.now() + 30 * 60 * 1000
    });
  }
}
