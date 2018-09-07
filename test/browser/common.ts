/* eslint-disable no-console */
const puppeteer = require('puppeteer');
const { createServer } = require('http');
const { createSession } = require ('app/server/middleware/session');
const { bootstrap } = require('test/browser/bootstrap');
const LoginPage = require('test/page-objects/login');
const TaskListPage = require('test/page-objects/task-list');
const { setup } = require('app/server/app');
const config = require('config');
const dysonSetup = require('test/mock/dysonSetup');

const testUrl = config.get('testUrl');
const port = config.get('node.port');
const headless = config.get('headless') !== 'false';
const httpProxy = config.get('httpProxy');
const testingLocalhost = testUrl.indexOf('localhost') !== -1;

let browser;
let server;
let cohTestData;
let ccdCase;
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

async function login(page) {
  const email = ccdCase && ccdCase.email || 'someone@example.com';
  loginPage = new LoginPage(page);
  taskListPage = new TaskListPage(page);
  await loginPage.visitPage();
  await loginPage.login(email);
  taskListPage.verifyPage();
}

async function startServices(options?) {
  const opts = options || {};
  if (opts.bootstrapData && !testingLocalhost && (!ccdCase || !cohTestData)) {
    const bootstrapResult = await bootstrap();
    ccdCase = bootstrapResult.ccdCase;
    cohTestData = bootstrapResult.cohTestData;
  }
  await startAppServer();
  await startBrowser();
  const page = await browser.newPage();
  await page.setViewport({
    height: 700,
    width: 1100
  });
  if (opts.performLogin) {
    await login(page);
  }
  return { page, ccdCase: ccdCase || {}, cohTestData: cohTestData || {} };
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

export { startServices };
