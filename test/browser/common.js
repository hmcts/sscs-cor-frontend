/* eslint-disable init-declarations, no-console */
const puppeteer = require('puppeteer');
const { createServer } = require('http');
const { setup } = require('app');
const { port, baseUrl } = require('test/config');

let browser;
let server;

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

function startAppServer() {
  if (!server && baseUrl.indexOf('localhost') !== -1) {
    console.log('Starting server');
    server = createServer(setup()).listen(port);
  }
}

async function startServices() {
  startAppServer();
  await startBrowser();
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  return { page };
}

after(async() => {
  if (server && server.close) {
    console.log('Killing server');
    server.close();
  }
  if (browser && browser.close) {
    console.log('Killing browser');
    await browser.close();
  }
});

module.exports = { startServices };
