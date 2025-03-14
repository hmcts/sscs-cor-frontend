import puppeteer, { Browser, Page } from 'puppeteer';

import { AssignCasePage } from 'test/page-objects/assign-case';
import { LoginPage } from 'test/page-objects/login';
import { StatusPage } from '../page-objects/status';
import { TaskListPage } from 'test/page-objects/task-list';

import * as sidam from 'test/fixtures/sidam';
import { URL } from 'url';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

import config from 'config';

import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { createSession } from 'app/server/middleware/session';
import { bootstrap } from 'test/browser/bootstrap';
import { setupApp } from 'app/server/app';
import { dysonSetupIdam } from 'test/mock/idam/dysonSetup';
import { dysonSetupS2s } from 'test/mock/s2s/dysonSetup';
import { dysonSetupTribunals } from 'test/mock/tribunals/dysonSetup';
import { Application } from 'express';
import { SidamUser } from 'test/fixtures/sidam';
import { CCDCase } from '../fixtures/ccd';

const logger: LoggerInstance = Logger.getLogger('test browser common');

const idamUrl: string = config.get('idam.url');
const testUrl: string = config.get('testUrl');
const port: number = config.get('node.port');
const headless: boolean = config.get('headless') !== 'false';
const testingLocalhost: boolean = testUrl.indexOf('localhost') !== -1;

let browser: Browser = null;
let server: Server<typeof IncomingMessage, typeof ServerResponse> = null;
let ccdCase: CCDCase = null;
const sidamUsers: SidamUser[] = [];
let loginPage: LoginPage = null;
let taskListPage: TaskListPage = null;

// eslint-disable-next-line mocha/no-exports
export const CY_CONTACT_US_OPEN_HEIGHT = 465;
// eslint-disable-next-line mocha/no-exports
export const EN_CONTACT_US_OPEN_HEIGHT = 585; // 1035;

async function startBrowser(): Promise<Browser> {
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
    const app: Application = await setupApp(createSession());
    dysonSetupIdam();
    dysonSetupS2s();
    dysonSetupTribunals();
    server = createServer(app)
      .listen(port)
      .on('error', (error) => {
        logger.error(
          `Unable to start server on port ${port} because of ${error.message}`
        );
      });
  }
  return Promise.resolve();
}

// eslint-disable-next-line mocha/no-exports
export async function login(page, force?, assignCase?): Promise<void> {
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
export async function startServices(options?): Promise<{
  sidamUser: SidamUser;
  browser: Browser;
  page: Page;
  ccdCase: CCDCase;
}> {
  const opts = options || {};
  let sidamUser: SidamUser;
  logger.info(`testingLocalhost--------${testingLocalhost}`);
  if (opts.bootstrapData && !testingLocalhost) {
    ({ ccdCase, sidamUser } = await bootstrap(
      opts.hearingType,
      opts.benefitType
    ));
    if (!ccdCase) {
      ccdCase = {};
    }
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
  return { page, ccdCase, sidamUser, browser };
}

after(async function (): Promise<void> {
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

async function closeBrowser(): Promise<void> {
  if (server?.close) {
    logger.info('Killing server');
    server.close();
  }
  if (browser?.close) {
    logger.info('Killing browser');
    await browser.close();
  }
}
