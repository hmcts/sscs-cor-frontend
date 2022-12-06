import { startServices } from 'test/browser/common';

import { Page } from 'puppeteer';

import { expect } from 'test/chai-sinon';

import config from 'config';

const testUrl: string = config.get('testUrl');

describe('Health check @smoke', function () {
  let page: Page = null;

  before(async function () {
    const res = await startServices();
    page = res.page;
  });

  after(async function () {
    if (page?.close) {
      await page.close();
    }
  });

  it('is up', async function () {
    const response = await page.goto(`${testUrl}/health`);
    /* eslint-disable-next-line no-unused-expressions */
    expect(response.ok()).to.be.true;
  });
});
