import * as puppeteer from 'puppeteer';

import { AssignCasePage } from 'test/page-objects/assign-case';
import { LoginPage } from 'test/page-objects/login';
import { StatusPage } from '../page-objects/status';
import { TaskListPage } from 'test/page-objects/task-list';

import * as sidam from 'test/fixtures/sidam';
import { URL } from 'url';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

import * as config from 'config';

const { createServer } = require('http');
const { createSession } = require('app/server/middleware/session');
const { bootstrap } = require('test/browser/bootstrap');
const { setup } = require('app/server/app');
const dysonSetupCorBackend = require('test/mock/cor-backend/dysonSetup');
const dysonSetupIdam = require('test/mock/idam/dysonSetup');
const dysonSetupS2s = require('test/mock/s2s/dysonSetup');
const dysonSetupTribunals = require('test/mock/tribunals/dysonSetup');

const logger: LoggerInstance = Logger.getLogger('test browser common');

const idamUrl: string = config.get('idam.url');
const testUrl: string = config.get('testUrl');
const port: number = config.get('node.port');
const headless: boolean = config.get('headless') !== 'false';
const testingLocalhost: boolean = testUrl.indexOf('localhost') !== -1;

let browser;
let server;
let ccdCase;
const sidamUsers = [];
let loginPage;
let taskListPage;

async function startBrowser() {
  if (!browser) {
    logger.info('Starting browser');
    const args = ['--no-sandbox', '--start-maximized'];
    const opts = {
      args,
      headless,
      timeout: 10000,
      ignoreHTTPSErrors: true,
    };
    try {
      browser = await puppeteer.launch(opts);
    } catch (error) {
      logger.error('Unable to start browser', error);
    }
  }

  return browser;
}

async function startAppServer(): Promise<void> {
  if (!server && testingLocalhost) {
    const app = setup(createSession(), { disableAppInsights: true });
    dysonSetupCorBackend();
    dysonSetupIdam();
    dysonSetupS2s();
    dysonSetupTribunals();
    server = createServer(app).listen(port, async (error) => {
      if (error) {
        logger.error(
          `Unable to start server on port ${port} because of ${error.message}`
        );
        return Promise.reject(error);
      }
      logger.info(`Starting server on port ${port}`);
      return Promise.resolve();
    });
  }
  return Promise.resolve();
}

// eslint-disable-next-line mocha/no-exports
export async function login(page, force?, assignCase?) {
  const sidamUser = sidamUsers[0];
  const email = sidamUser?.email || ccdCase?.email || 'someone@example.com';
  const password = sidamUser?.password || 'somePassword';
  const tya = ccdCase ? ccdCase.appellant_tya : 'someTya';
  loginPage = new LoginPage(page);
  taskListPage = new TaskListPage(page);
  logger.info('in login');

  const isOnIdamPage = () => page.url().indexOf(idamUrl) >= 0;
  const signInFailed = () => page.url().indexOf(`${testUrl}/sign-in`) >= 0;
  logger.info(`is on idam page [${isOnIdamPage()}]`);
  logger.info(`sign in failed [${signInFailed()}]`);
  logger.info(`force [${force}]`);
  if (isOnIdamPage() || force) {
    await loginPage.visitPage(`?tya=${tya}`);
    await loginPage.login(email, password);
    let maxRetries = 10;
    while ((isOnIdamPage() || signInFailed()) && maxRetries > 0) {
      logger.info('Login attempt failed, retrying...');
      await new Promise((r) => setTimeout(r, 500));
      await loginPage.visitPage();
      await loginPage.login(email, password);
      maxRetries -= 1;
    }
  }

  if (assignCase === undefined || assignCase) {
    logger.info('Assigning case');
    if (new URL(page.url()).pathname.includes('assign-case')) {
      const assignCasePage = new AssignCasePage(page);
      await assignCasePage.fillPostcode('TN32 6PL');
      await assignCasePage.submit();

      const statusPage = new StatusPage(page);
    }
  }

  logger.info(`Login function finished. On ${page.url()}`);
}

// eslint-disable-next-line mocha/no-exports
export async function startServices(options?) {
  const opts = options || {};
  let sidamUser;
  logger.info(`testingLocalhost--------${testingLocalhost}`);
  if (opts.bootstrapData && !testingLocalhost) {
    ({ ccdCase, sidamUser } = await bootstrap(opts.hearingType));
    sidamUsers.unshift(sidamUser);
  }
  await startAppServer();
  const browser = await startBrowser();
  let page: puppeteer.Page;

  try {
    page = await browser.newPage();
  } catch (error) {
    logger.error('Error startServices browser new page', error);
  }

  await page.setViewport({
    height: 700,
    width: 1100,
  });
  if (opts.performLogin) {
    await login(page, opts.forceLogin, opts.assignCase);
  }
  return { page, ccdCase: ccdCase || {}, sidamUser, browser };
}

after(async function () {
  if (sidamUsers.length > 0) {
    logger.info('Clean up sidam');
    // await sidam.unregisterRedirectUri();
    for (const sidamUser of sidamUsers) {
      logger.info(`Deleting user ${sidamUser.email}`);
      await sidam.deleteUser(sidamUser);
    }
  }
  await closeBrowser();
});

async function closeBrowser() {
  if (server?.close) {
    logger.info('Killing server');
    server.close();
  }
  if (browser?.close) {
    logger.info('Killing browser');
    await browser.close();
  }
}
