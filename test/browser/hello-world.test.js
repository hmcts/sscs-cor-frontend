const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const { baseUrl } = require('test/config');
const paths = require('paths');

describe('Hello world', () => {
  /* eslint-disable init-declarations */
  let page;
  /* eslint-enable init-decalarations */

  before(async() => {
    const res = await startServices();
    page = res.page;
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('has Hello world heading', async() => {
    await page.goto(`${baseUrl}${paths.helloWorld}`);
    const heading = await page.$eval('h1', el => el.innerHTML);
    expect(heading).to.equal('Hello world');
  });
});
