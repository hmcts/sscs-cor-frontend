const { expect } = require('test/chai-sinon');
const config = require('config');

const testUrl = config.get('testUrl');

class BasePage {
  constructor(page) {
    this.page = page;
    this.pagePath = '/';
  }

  async visitPage() {
    await this.page.goto(`${testUrl}${this.pagePath}`);
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

  async getElement(selector) {
    const element = await this.page.$(selector);
    return element;
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
      path: `functional-output/${filename}.png`
    });
  }
}

module.exports = BasePage;
