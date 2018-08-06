/* eslint-disable init-declarations, no-console */
const puppeteer = require('puppeteer');
const { createServer } = require('http');
const session = require('express-session');
const { setup } = require('app');
const config = require('config');

const testUrl = config.get('testUrl');
const port = config.get('node.port');

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
      timeout: 10000,
      ignoreHTTPSErrors: true
    };
    browser = await puppeteer.launch(opts);
  }
}

function startAppServer() {
  if (!server && testUrl.indexOf('localhost') !== -1) {
    console.log(`Starting server on port ${port}`);
    const app = setup(session({
      cookie: {
        httpOnly: true,
        maxAge: config.get('session.cookie.maxAgeInMs'),
        secure: false
      },
      resave: true,
      saveUninitialized: true,
      secret: config.get('session.cookie.secret')
    }), { disableAppInsights: true });
    server = createServer(app).listen(port);
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
