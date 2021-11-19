import { Page } from 'puppeteer';
const config = require('config');
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { RequestTypePage } from 'test/page-objects/request-type';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
const content = require('locale/content');
const pa11y = require('pa11y');
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
let pa11yOpts = _.clone(config.get('pa11y'));

describe('Hearing Recording request @mya @nightly', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let requestTypePage: RequestTypePage;
  let loginPage: LoginPage;
  let assignCasePage: AssignCasePage;
  let statusPage: StatusPage;
  let ccdCase;
  let sidamUser;
  before('start services and bootstrap data in CCD/COH', async () => {
    ({ ccdCase, page, sidamUser = {} } = await startServices({ bootstrapData: true, hearingType: 'oral' }));
    const appellantTya = ccdCase.hasOwnProperty('appellant_tya') ? ccdCase.appellant_tya : 'anId';
    pa11yOpts.browser = page.browser;
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    requestTypePage = new RequestTypePage(page);
    taskListPage = new TaskListPage(page);
    await loginPage.visitPage(`?tya=${appellantTya}`);
    await loginPage.login(sidamUser.email || 'oral.appealReceived@example.com', sidamUser.password || '');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('Navigate to request page', async () => {
    assignCasePage.verifyPage();
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();
    await page.waitFor(500);
    await page.reload();
    statusPage.verifyPage();
    await requestTypePage.visitPage();
  });

  it('Navigate to Request Type tab', async() => {
    await statusPage.clickElement('#tab-requestType');
    await page.waitFor(500);

    expect(await requestTypePage.getElementText('.govuk-tabs__list-item--selected')).contain(content.en.requestTypeTab.tabHeader);
    expect(await requestTypePage.getElementText('.task-list div div')).contain(content.en.requestTypeTab.selectRequestHeader);
  });

  /* PA11Y */
  it.skip('checks /request-type page passes @pa11y', async () => {
    requestTypePage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-request-type-page.png`;
    pa11yOpts.page = await requestTypePage.page;
    const result = await pa11y(pa11yOpts);
    // Request type form gets submitted on changing the value. Here PA11Y test throws "This form does not contain a submit button error"
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('Select hearing recording option and shows list of hearing recording available', async () => {
    requestTypePage.verifyPage();
    await requestTypePage.selectRequestOption();
    await page.waitFor(500);
    requestTypePage.verifyPage();

    expect(await requestTypePage.getElementText('#released-hearing-recording h3')).to.equal(content.en.hearingRecording.hearingRecordings);
    expect(await requestTypePage.getElementText('#outstanding-hearing-recording h3')).to.equal(content.en.hearingRecording.outstandingHearingRecordings);
    expect(await requestTypePage.getElementText('#hearing-recording-request-submit-form h3')).to.equal(content.en.hearingRecording.hearingRecordingRequests);
  });

});
