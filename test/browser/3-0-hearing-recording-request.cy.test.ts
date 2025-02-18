import { Page } from 'puppeteer';

import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { RequestTypePage } from 'test/page-objects/request-type';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
import config from 'config';
import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';

import pa11y from 'pa11y';

const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
const pa11yOpts = _.clone(config.get('pa11y'));
const testUrl = config.get('testUrl');

describe('CY - Hearing Recording request @mya @nightly', function () {
  let page: Page;
  let taskListPage: TaskListPage;
  let requestTypePage: RequestTypePage;
  let loginPage: LoginPage;
  let assignCasePage: AssignCasePage;
  let statusPage: StatusPage;
  let ccdCase;
  let sidamUser;

  before('start services and bootstrap data in CCD', async function () {
    ({
      ccdCase,
      page,
      sidamUser = {},
    } = await startServices({ bootstrapData: true, hearingType: 'oral' }));
    const appellantTya = ccdCase.hasOwnProperty('appellant_tya')
      ? ccdCase.appellant_tya
      : 'anId';
    pa11yOpts.browser = page.browser;
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    requestTypePage = new RequestTypePage(page);
    taskListPage = new TaskListPage(page);
    await loginPage.visitPage(`?tya=${appellantTya}`);
    await loginPage.login(
      sidamUser.email || 'oral.appealReceived@example.com',
      sidamUser.password || ''
    );
  });

  after(async function () {
    if (page?.close) {
      await page.close();
    }
  });

  it('CY - Navigate to request page', async function () {
    await assignCasePage.clickLanguageToggle();
    await page.reload();
    assignCasePage.verifyPage();
    assignCasePage.verifyLanguage('cy');
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();
    await page.waitForTimeout(500);
    await page.reload();
    statusPage.verifyPage();
    await requestTypePage.visitPage();
  });

  it('CY - Navigate to Request Type tab', async function () {
    await statusPage.clickElement('#tab-requestType');
    await page.waitForTimeout(500);

    expect(
      await requestTypePage.getElementText('.govuk-tabs__list-item--selected')
    ).contain(content.cy.requestTypeTab.tabHeader);
    expect(await requestTypePage.getElementText('.task-list div div')).contain(
      content.cy.requestTypeTab.selectRequestHeader
    );
  });

  /* PA11Y */
  it.skip('checks /request-type page passes @pa11y', async function () {
    requestTypePage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-request-type-page.png`;
    pa11yOpts.page = requestTypePage.page;
    const result = await pa11y(
      `${testUrl}${requestTypePage.pagePath}`,
      pa11yOpts
    );
    // Request type form gets submitted on changing the value. Here PA11Y test throws "This form does not contain a submit button error"
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  it('CY - Select hearing recording option and shows list of hearing recording available', async function () {
    requestTypePage.verifyPage();
    await requestTypePage.selectRequestOption();
    await page.waitForTimeout(2000);
    requestTypePage.verifyPage();
    expect(
      await requestTypePage.getElementText('#released-hearing-recording h3')
    ).to.equal(content.cy.hearingRecording.releasedHearingRecordings);
    expect(
      await requestTypePage.getElementText('#outstanding-hearing-recording h3')
    ).to.equal(content.cy.hearingRecording.outstandingHearingRecordings);
    expect(
      await requestTypePage.getElementText(
        '#hearing-recording-request-submit-form h3'
      )
    ).to.equal(content.cy.hearingRecording.hearingRecordingRequests);
  });
});
