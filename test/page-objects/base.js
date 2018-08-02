const { expect } = require('test/chai-sinon');
const { baseUrl } = require('test/config');

class BasePage {
  constructor(page) {
    this.page = page;
    this.pagePath = '/';
  }

  async visitPage() {
    await this.page.goto(`${baseUrl}${this.pagePath}`);
  }

  verifyPage() {
    expect(this.page.url()).to.equal(`${baseUrl}${this.pagePath}`);
  }

  async getHeading() {
    const heading = await this.page.$eval('h1', el => el.innerHTML);
    return heading;
  }
}

module.exports = BasePage;
