import * as _ from 'lodash';

import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';

import { TaskListPage } from 'test/page-objects/task-list';
import { LoginPage } from 'test/page-objects/login';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';

import config from 'config';

const testUrl = config.get('testUrl');

const sampleHearingId = '1-pending';

import pa11y from 'pa11y';

const pa11yOpts = _.clone(config.get('pa11y'));
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');

const logger: LoggerInstance = Logger.getLogger('1-task-list.test');

describe('Task list page', function () {
  let page: Page;
  let taskListPage: TaskListPage;
  let loginPage: LoginPage;
  let hearingId;
  let caseReference;

  before('start services and bootstrap data in CCD', async function () {
    const res = await startServices({
      bootstrapData: true,
      performLogin: true,
    });
    page = res.page;
    pa11yOpts.browser = res.browser;
    hearingId = sampleHearingId;
    caseReference = res.ccdCase.case_reference || '112233';
    taskListPage = new TaskListPage(page);
    loginPage = new LoginPage(page);
    await taskListPage.screenshot('task-list');
  });

  afterEach(function () {
    if (this.currentTest.state !== 'passed') {
      const testName = this.currentTest.title.replace(/[ /]/g, '_');
      taskListPage.screenshot(`failed-${testName}`).catch((err) => {
        logger.error(err);
      });
    }
  });

  after(async function () {
    if (page?.close) {
      await page.close();
    }
  });

  it('is on the /task-list path', async function () {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    taskListPage.verifyPage();
  });

  it('checks /task-list passes @pa11y', async function () {
    pa11yOpts.page = taskListPage.page;
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/task-list.png`;
    const result = await pa11y(`${testUrl}${taskListPage.pagePath}`, pa11yOpts);
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  it('displays the appellant case reference', async function () {
    const displayedCaseRef = await taskListPage.getElementText(
      '#case-reference'
    );
    expect(displayedCaseRef).to.equal(caseReference);
  });

  it('displays Providing additional evidence link', async function () {
    const evidenceUploadLink = await taskListPage.getElementText(
      '#evidence-options-link'
    );
    expect(evidenceUploadLink).to.equal(
      content.en.taskList.sendingEvidence.anchorText
    );
  });

  it('signs out and prevents access to pages', async function () {
    await taskListPage.signOut();
    loginPage.verifyPage();
    await taskListPage.visitPage();
    loginPage.verifyPage();
  });
});
