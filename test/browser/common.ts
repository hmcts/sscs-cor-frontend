/* eslint-disable no-console */
import * as puppeteer from 'puppeteer';
import { Page } from 'puppeteer';
const { createServer } = require('http');
const { createSession } = require ('app/server/middleware/session');
const { bootstrap, createAndIssueDecision } = require('test/browser/bootstrap');
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
const { setup } = require('app/server/app');
const config = require('config');
const dysonSetupCorBackend = require('test/mock/cor-backend/dysonSetup');
const dysonSetupCoh = require('test/mock/coh/dysonSetup');
const dysonSetupIdam = require('test/mock/idam/dysonSetup');
import * as sidam from 'test/fixtures/sidam';

const idamUrl = config.get('idam.url');
const testUrl = config.get('testUrl');
const port = config.get('node.port');
const headless = config.get('headless') !== 'false';
const httpProxy = config.get('httpProxy');
const testingLocalhost = testUrl.indexOf('localhost') !== -1;

let browser;
let server;
let cohTestData;
let ccdCase;
let sidamUsers = [];
let loginPage;
let taskListPage;

async function startBrowser() {
  if (!browser) {
    console.log('Starting browser');
    const args = ['--no-sandbox', '--start-maximized'];
    if (httpProxy) {
      args.push(`-proxy-server=${httpProxy}`);
    }
    const opts = {
      args,
      headless,
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
    dysonSetupCorBackend();
    dysonSetupCoh();
    dysonSetupIdam();
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

export async function login(page, force?) {
  const sidamUser = sidamUsers[0];
  const email = sidamUser && sidamUser.email || 'someone@example.com';
  const password = sidamUser && sidamUser.password || 'somePassword';
  loginPage = new LoginPage(page);
  taskListPage = new TaskListPage(page);
  await taskListPage.visitPage();
  const isOnIdamPage = () => page.url().indexOf(idamUrl) >= 0;
  if (isOnIdamPage() || force) {
    await loginPage.visitPage();
    await loginPage.login(email, password);
    let maxRetries = 5;
    while (isOnIdamPage() && maxRetries > 0) {
      console.log('Login attempt failed, retrying...');
      await new Promise(r => setTimeout(r, 500));
      await loginPage.login(email, password);
      maxRetries--;
    }
  }
}

async function startServices(options?) {
  const opts = options || {};
  if (opts.bootstrapData && !testingLocalhost) {
    const bootstrapResult = await bootstrap();
    ccdCase = bootstrapResult.ccdCase;
    cohTestData = bootstrapResult.cohTestData;
    sidamUsers.unshift(bootstrapResult.sidamUser);
  }
  if (opts.issueDecision) {
    const hearingId = (cohTestData && cohTestData.hearingId) || '4-view-issued';
    await createAndIssueDecision(hearingId);
  }
  await startAppServer();
  await startBrowser();
  const page: Page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  if (opts.performLogin) {
    await login(page, opts.forceLogin);
  }
  return { page, ccdCase: ccdCase || {}, cohTestData: cohTestData || {} };
}

after(async() => {
  if (sidamUsers.length) {
    console.log('Clean up sidam');
    await sidam.unregisterRedirectUri();
    sidamUsers.forEach(async (sidamUser) => {
      console.log(`Deleting user ${sidamUser.email}`);
      await sidam.deleteUser(sidamUser);
    });
  }

  if (server && server.close) {
    console.log('Killing server');
    server.close();
  }
  if (browser && browser.close) {
    console.log('Killing browser');
    await browser.close();
  }
});

export { startServices };
