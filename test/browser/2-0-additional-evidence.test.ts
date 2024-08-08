import { Page } from 'puppeteer';

import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { AdditionalEvidencePage } from 'test/page-objects/additional-evidence';
import { allowedActions } from 'app/server/controllers/additional-evidence';
import { AdditionalEvidenceStatementPage } from 'test/page-objects/additional-evidence-statement';
import { AdditionalEvidenceConfirmationPage } from 'test/page-objects/additional-evidence-confirmation';
import { AdditionalEvidenceUploadPage } from 'test/page-objects/additional-evidence-upload';
import { AdditionalEvidenceUploadAudioVideoPage } from 'test/page-objects/additional-evidence-upload-audio';
import { AdditionalEvidencePostPage } from 'test/page-objects/additional-evidence-post';
import { AdditionalEvidenceCoversheetPage } from 'test/page-objects/additional-evidence-coversheet';
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

describe('Additional Evidence @mya @nightly', function () {
  let page: Page;
  let taskListPage: TaskListPage;
  let additionalEvidencePage: AdditionalEvidencePage;
  let additionalEvidenceStatementPage: AdditionalEvidenceStatementPage;
  let additionalEvidenceConfirmationPage: AdditionalEvidenceConfirmationPage;
  let additionalEvidenceUploadPage: AdditionalEvidenceUploadPage;
  let additionalEvidenceUploadAudioVideoPage: AdditionalEvidenceUploadAudioVideoPage;
  let additionalEvidencePostPage: AdditionalEvidencePostPage;
  let additionalEvidenceCoversheetPage: AdditionalEvidenceCoversheetPage;
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
    additionalEvidencePage = new AdditionalEvidencePage(page);
    additionalEvidenceStatementPage = new AdditionalEvidenceStatementPage(page);
    additionalEvidenceConfirmationPage = new AdditionalEvidenceConfirmationPage(
      page
    );
    additionalEvidenceUploadPage = new AdditionalEvidenceUploadPage(page);
    additionalEvidenceUploadAudioVideoPage =
      new AdditionalEvidenceUploadAudioVideoPage(page);
    additionalEvidencePostPage = new AdditionalEvidencePostPage(page);
    additionalEvidenceCoversheetPage = new AdditionalEvidenceCoversheetPage(
      page
    );
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

  it('navigate to additional evidence page', async function () {
    assignCasePage.verifyPage();
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    await page.reload();
    statusPage.verifyPage();
    await additionalEvidencePage.visitPage();
  });

  it('Verify additional evidence options', async function () {
    additionalEvidencePage.verifyPage();

    const header = await additionalEvidencePage.getElementText('h1');
    expect(header).to.equal(
      content.en.additionalEvidence.evidenceOptions.header
    );
    const options = await additionalEvidencePage.getElementsValues(
      "input[name='additional-evidence-option']"
    );
    options.forEach((option) => {
      expect(allowedActions).to.contain(option);
    });
  });

  it('fills a statement and submit and shows confirmation page and returns to appeal page', async function () {
    additionalEvidencePage.verifyPage();
    await additionalEvidencePage.selectStatementOption();
    await additionalEvidencePage.submit();

    additionalEvidenceStatementPage.verifyPage();
    await additionalEvidenceStatementPage.addStatement('this is my statement');
    await additionalEvidenceStatementPage.submit();

    additionalEvidenceConfirmationPage.verifyPage();
    await additionalEvidenceConfirmationPage.returnToAppealPage();
    taskListPage.verifyPage();
  });

  /* PA11Y */
  it('checks /task-list passes @pa11y', async function () {
    await taskListPage.visitPage();
    pa11yOpts.page = taskListPage.page;
    // pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-task-list.png`;
    const result = await pa11y(`${testUrl}${taskListPage.pagePath}`, pa11yOpts);
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  /* PA11Y */
  it('checks /additional-evidence page path passes @pa11y', async function () {
    await additionalEvidencePage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-page.png`;
    pa11yOpts.page = additionalEvidencePage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidencePage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  /* PA11Y */
  it('checks /additional-evidence-upload page path passes @pa11y', async function () {
    await additionalEvidenceUploadPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-upload-page.png`;
    pa11yOpts.page = additionalEvidenceUploadPage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidenceUploadPage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  /* PA11Y */
  it('checks /additional-evidence-upload-audio-video page path passes @pa11y', async function () {
    await additionalEvidenceUploadAudioVideoPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-upload-audio-video-page.png`;
    pa11yOpts.page = additionalEvidenceUploadAudioVideoPage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidenceUploadAudioVideoPage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  /* PA11Y */
  it('checks /additional-evidence/statement page path passes @pa11y', async function () {
    await additionalEvidenceStatementPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-statement-page.png`;
    pa11yOpts.page = additionalEvidenceStatementPage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidenceStatementPage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  /* PA11Y */
  it('checks /additional-evidence/post page path passes @pa11y', async function () {
    await additionalEvidencePostPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-post-page.png`;
    pa11yOpts.page = additionalEvidencePostPage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidencePostPage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );
  });

  it('shows an error if no file to upload and no description', async function () {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    await additionalEvidenceUploadPage.submit();
    expect(
      await additionalEvidenceUploadPage.getElementText(
        'div.govuk-error-summary'
      )
    ).contain(
      content.en.additionalEvidence.evidenceUpload.error.emptyDescription
    );
    expect(
      await additionalEvidenceUploadPage.getElementText(
        'div.govuk-error-summary'
      )
    ).contain(
      content.en.additionalEvidence.evidenceUpload.error.noFilesUploaded
    );
  });

  it('shows an error if no file to upload', async function () {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    await additionalEvidenceUploadPage.addDescription(
      'The evidence description'
    );
    await additionalEvidenceUploadPage.submit();
    expect(
      await additionalEvidenceUploadPage.getElementText(
        'div.govuk-error-summary'
      )
    ).contain(
      content.en.additionalEvidence.evidenceUpload.error.noFilesUploaded
    );
  });

  it('uploads a file and shows file list and check evidence confirmation page @pally', async function () {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    expect(await additionalEvidenceUploadPage.getHeading()).to.equal(
      content.en.additionalEvidence.evidenceUpload.header
    );

    await additionalEvidenceUploadPage.selectFile('evidence.txt');
    await page.waitForTimeout(10000);

    await additionalEvidenceUploadPage.addDescription(
      'The evidence description'
    );
    await additionalEvidenceUploadPage.submit();
    await page.waitForTimeout(6000);

    /* PA11Y */
    additionalEvidenceConfirmationPage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/en-additional-evidence-confirmation-page.png`;
    pa11yOpts.page = additionalEvidenceConfirmationPage.page;
    const result = await pa11y(
      `${testUrl}${additionalEvidenceConfirmationPage.pagePath}`,
      pa11yOpts
    );
    expect(result.issues.length).to.equal(
      0,
      JSON.stringify(result.issues, null, 2)
    );

    await additionalEvidenceConfirmationPage.returnToAppealPage();
    taskListPage.verifyPage();
  });

  it('uploads an audio file and shows file list and check evidence confirmation page', async function () {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadAudioVideoOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadAudioVideoPage.verifyPage();
    await page.waitForTimeout(4000);
    expect(await additionalEvidenceUploadAudioVideoPage.getHeading()).to.equal(
      content.en.additionalEvidence.evidenceUpload.header
    );

    await additionalEvidenceUploadAudioVideoPage.selectFile('test_audio.mp3');
    await page.waitForTimeout(5000);

    await additionalEvidenceUploadAudioVideoPage.addDescription(
      'The evidence description for AV file'
    );
    await additionalEvidenceUploadAudioVideoPage.submit();
    await page.waitForTimeout(4000);

    additionalEvidenceConfirmationPage.verifyPage();
  });

  it('shows additional evidence post page', async function () {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectPostOption();
    await additionalEvidencePage.submit();
    additionalEvidencePostPage.verifyPage();
  });
});
