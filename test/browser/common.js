/* eslint-disable init-declarations, no-console */
const puppeteer = require('puppeteer');
const { createServer } = require('http');
const createSession = require('app/middleware/session');
const coh = require('test/fixtures/coh');
const { setup } = require('app');
const config = require('config');
const dysonSetup = require('test/mock/dysonSetup');

const testUrl = config.get('testUrl');
const port = config.get('node.port');
const testingLocalhost = testUrl.indexOf('localhost') !== -1;

let browser;
let server;
let cohTestData;

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
    try {
      browser = await puppeteer.launch(opts);
    } catch (error) {
      console.log('Unable to start browser', error);
    }
  }
}

function startAppServer() {
  if (!server && testingLocalhost) {
    const app = setup(createSession(), { disableAppInsights: true });
    dysonSetup();
    server = createServer(app).listen(port, error => {
      if (error) {
        console.log(`Unable to start server on port ${port} because of ${error.message}`);
        return Promise.reject(error);
      }
      console.log(`Starting server on port ${port}`);
      return Promise.resolve();
    });
  }
}

async function bootstrapCoh() {
  if (!cohTestData && !testingLocalhost) {
    try {
      const hearingId = await coh.createOnlineHearing();
      const questionId = await coh.createQuestion(hearingId);
      await coh.setQuestionRoundToIssued(hearingId);
      cohTestData = { hearingId, questionId };
    } catch (error) {
      console.log('Error bootstrapping COH with test data', error);
    }
  }
}

async function startServices(options) {
  const opts = options || {};
  if (opts.bootstrapCoh) {
    await bootstrapCoh();
  }
  await startAppServer();
  await startBrowser();
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  return { page, cohTestData: cohTestData || {} };
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
