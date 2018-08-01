/* eslint-disable init-declarations, no-console */
const puppeteer = require('puppeteer');

let browser;

async function startBrowser() {
  if (!browser) {
    console.log('Starting browser');
    const opts = {
      args: [
        '--no-sandbox',
        '--start-maximized'
      ],
      headless: true,
      timeout: 10000
    };
    browser = await puppeteer.launch(opts);
  }
}

async function startServices() {
  await startBrowser();
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  return { page };
}

module.exports = { startServices };
