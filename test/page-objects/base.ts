import { Page } from 'puppeteer';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import config from 'config';
import { expect } from 'test/chai-sinon';

const logger: LoggerInstance = Logger.getLogger('functional test base');

const testUrl: string = config.get('testUrl');
const navigationTimeout: number = config.get('navigationTimeout');

export class BasePage {
  public page: Page;
  public pagePath: string;

  constructor(page) {
    this.page = page;
    this.page.setDefaultNavigationTimeout(navigationTimeout);
    this.pagePath = '/';
  }

  async visitPage(query = '') {
    try {
      logger.info(`goto [${testUrl}${this.pagePath}${query}]`);
      await this.page.goto(`${testUrl}${this.pagePath}${query}`);
      await this.page.waitForSelector('body');
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception catched in visitPage, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-visit-${filename}`);
    }
  }

  getFileName() {
    let filename: string;
    if (this.pagePath === '/') {
      filename = 'home';
    } else {
      filename = this.pagePath.replace(/\//g, '-');
    }
    return filename;
  }

  verifyPage() {
    logger.info(`Verify page - Page URL: ${this.page.url()}`);
    expect(this.page.url(), `URL: ${this.page.url()}`).to.contain(
      `${testUrl}${this.pagePath}`
    );
  }

  verifyLanguage(language: string) {
    logger.info(`Verify language - Page URL: ${this.page.url()}`);
    expect(this.page.url(), `URL: ${this.page.url()}`).to.contain(
      `lng=${language}`
    );
  }

  getCurrentUrl() {
    const url = this.page.url();
    return url;
  }

  async getHeading() {
    try {
      const heading = await this.page.$eval('h1', (el) =>
        el.innerHTML.replace(/(^\s+|\s+$)/g, '')
      );
      return heading;
    } catch (error) {
      const filename = `failed-getHeading-${this.getFileName()}`;
      logger.info(
        `Exception caught in getHeading on ${this.page.url()}, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(filename);
    }
  }

  async getBody() {
    try {
      const body = await this.page.$eval('body', (el) => el.innerHTML);
      return body;
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception caught in getBody, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-getBody-${filename}`);
    }
  }

  async openDetails(selector) {
    try {
      const element = await this.page.$eval(selector, (el) =>
        el.setAttribute('open', 'true')
      );
    } catch (error) {
      const filename = `failed-openDetails-${this.getFileName()}`;
      logger.info(
        `Exception caught in openDetails, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`${filename}`);
    }
  }

  async getElementText(selector) {
    try {
      const element = await this.page.$eval(
        selector,
        (el: HTMLElement) => el.innerText
      );
      return element;
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception caught in getElementText, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-getElementText-${filename}`);
    }
  }

  async getElementsText(selector) {
    try {
      const elements = await this.page.$$eval(
        selector,
        (nodes: HTMLElement[]) => nodes.map((n) => n.innerText)
      );
      return elements;
    } catch (error) {
      const filename = `failed-getElementsText-${this.getFileName()}`;
      logger.info(
        `Exception caught in getElementsText, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`${filename}`);
    }
  }

  async getElementValue(selector) {
    try {
      const element = await this.page.$eval(
        selector,
        (el: HTMLInputElement) => el.value
      );
      return element;
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception caught in getElementValue, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-getElementVal-${filename}`);
    }
  }

  async getElementsValues(selector) {
    const divsCounts = await this.page.$$eval(
      selector,
      (divs: HTMLInputElement[]) => divs.map((div) => div.value)
    );
    return divsCounts;
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
    await this.page.evaluate(
      (args) => {
        return (document.querySelector(args.selector).value = args.text);
      },
      { selector, text }
    );
  }

  async enterTextintoField(selector, text) {
    try {
      await this.page.$eval(selector, (el: HTMLInputElement) => {
        el.value = '';
      });
      await this.page.type(selector, text);
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception catched in enterTextintoField, taking screenshot ${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-enterText-${filename}`);
    }
  }

  async clickElement(selector) {
    try {
      await this.page.click(selector);
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception catched in clickElement with selector ${selector}, taking screenshot failed-click-${selector}-${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-click-${selector}-${filename}`);
    }
  }

  async selectOption(selector, value) {
    try {
      await this.page.select(selector, value);
    } catch (error) {
      const filename = this.getFileName();
      logger.info(
        `Exception catched in selectOption with selector ${selector} for ${value}, taking screenshot failed-click-${selector}-${filename}.png. Error is: ${error}`
      );
      await this.screenshot(`failed-click-${selector}-${filename}`);
    }
  }

  async screenshot(filename) {
    await this.page.screenshot({
      fullPage: true,
      path: `functional-output/functional-screenshots/${filename}.png`,
    });
  }

  async signOut() {
    let signOutSelector = '.govuk-header__link--signout';
    const signOutElement = await this.getElement(signOutSelector);
    if (!signOutElement) {
      signOutSelector = '.account-navigation__links .sign-out';
    }

    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement(signOutSelector),
    ]);
  }

  async deleteCookie(name: string) {
    await this.page.deleteCookie({
      url: testUrl,
      name,
    });
  }

  async setCookie(name: string, value: string) {
    await this.page.setCookie({
      value,
      name,
      url: testUrl,
      expires: Date.now() + 30 * 60 * 1000,
    });
  }

  async clickLanguageToggle() {
    logger.info(`Before toggle - Page URL: ${this.page.url()}`);
    // Wait for the link to show up
    page.wait_for_selector('.govuk-link.language');
    await this.clickElement('.govuk-link.language');
    logger.info(`After toggle - Page URL: ${this.page.url()}`);
  }
}
