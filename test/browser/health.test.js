const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const testUrl = require('config').get('testUrl');

describe('Health check @smoke', () => {
  /* eslint-disable-next-line init-declarations */
  let page;

  before(async() => {
    const res = await startServices();
    page = res.page;
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is up', async() => {
    const response = await page.goto(`${testUrl}/health`);
    /* eslint-disable-next-line no-unused-expressions */
    expect(response.ok()).to.be.true;
  });
});
