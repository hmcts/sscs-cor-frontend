const { expect } = require('test/chai-sinon');
const config = require('config');

const testUrl = config.get('testUrl');
const navigationTimeout = config.get('navigationTimeout');
export class BasePage {

  public page: any;
  public pagePath: string;

  constructor(page) {
    this.page = page;
    this.page.setDefaultNavigationTimeout(navigationTimeout);
    this.pagePath = '/';
  }

  async visitPage() {
    try {
      console.log(`goto [${testUrl}${this.pagePath}]`);
      await this.page.goto(`${testUrl}${this.pagePath}`);
      await this.page.waitForSelector('body');
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in visitPage, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-visit-${filename}`);
    }
  }

  getFileName() {
    let filename: string;
    if (this.pagePath === '/') {
      filename = 'home';
    } else {
      filename = this.pagePath.replace(/\//g,'-');
    }
    return filename;
  }

  verifyPage() {
    expect(this.page.url()).to.equal(`${testUrl}${this.pagePath}`);
  }

  getCurrentUrl() {
    const url = this.page.url();
    return url;
  }

  async getHeading() {
    try {
      const heading = await this.page.$eval('h1', el => el.innerHTML);
      return heading;
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in getHeading, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-getHeading-${filename}`);
    }
  }

  async getBody() {
    try {
      const body = await this.page.$eval('body', el => el.innerHTML);
      return body;
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in getBody, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-getBody-${filename}`);
    }
  }

  async getElementText(selector) {
    try {
      await this.page.waitForSelector(selector);
      const element = await this.page.$eval(selector, el => el.innerText);
      return element;
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in getElementText, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-getElementText-${filename}`);
    }
  }

  async getElementValue(selector) {
    try {
      const element = await this.page.$eval(selector, el => el.value);
      return element;
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in getElementValue, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-getElementVal-${filename}`);
    }
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
    try {
      await this.page.$eval(selector, el => {
        el.value = '';
      });
      await this.page.type(selector, text);
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in enterTextintoField, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-enterText-${filename}`);
    }
  }

  async clickElement(selector) {
    try {
      await this.page.click(selector);
    } catch (error) {
      const filename = this.getFileName();
      console.log(`Exception catched in clickElement, taking screenshot ${filename}.png. Error is: ${error}`);
      await this.screenshot(`failed-click-${filename}`);
    }
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
