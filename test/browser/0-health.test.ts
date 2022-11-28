import { startServices } from 'test/browser/common';

import { Page } from 'puppeteer';

const { expect } = require('test/chai-sinon');
const testUrl = require('config').get('testUrl');

describe('Health check @smoke', () => {
  let page: Page;

  before(async () => {
    const res = await startServices();
    page = res.page;
  });

  after(async () => {
    if (page?.close) {
      await page.close();
    }
  });

  it('is up', async () => {
    const response = await page.goto(`${testUrl}/health`);
    /* eslint-disable-next-line no-unused-expressions */
    expect(response.ok()).to.be.true;
  });
});

export {};
