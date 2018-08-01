const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const HelloWorldPage = require('test/page-objects/hello-world');

describe('Hello world page', () => {
  /* eslint-disable init-declarations */
  let page;
  let helloWorldPage;
  /* eslint-enable init-decalarations */

  before(async() => {
    const res = await startServices();
    page = res.page;
    helloWorldPage = new HelloWorldPage(page);
    await helloWorldPage.visitPage();
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /hello-world path', () => {
    helloWorldPage.verifyPage();
  });

  it('has Hello world heading', async() => {
    expect(await helloWorldPage.getHeading()).to.equal('Hello world');
  });
});
