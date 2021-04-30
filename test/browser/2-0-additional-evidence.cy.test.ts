import { Page } from 'puppeteer';
const config = require('config');
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { AdditionalEvidencePage } from 'test/page-objects/additional-evidence';
import { allowedActions } from 'app/server/controllers/additional-evidence';
import { AdditionalEvidenceStatementPage } from 'test/page-objects/additional-evidence-statement';
import { AdditionalEvidenceConfirmationPage } from 'test/page-objects/additional-evidence-confirmation';
import { AdditionalEvidenceUploadPage } from 'test/page-objects/additional-evidence-upload';
import { AdditionalEvidencePostPage } from 'test/page-objects/additional-evidence-post';
import { AdditionalEvidenceCoversheetPage } from 'test/page-objects/additional-evidence-coversheet';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
const content = require('locale/content');
const pa11y = require('pa11y');
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
let pa11yOpts = _.clone(config.get('pa11y'));

describe('CY - Additional Evidence @mya @nightly99', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let additionalEvidencePage: AdditionalEvidencePage;
  let additionalEvidenceStatementPage: AdditionalEvidenceStatementPage;
  let additionalEvidenceConfirmationPage: AdditionalEvidenceConfirmationPage;
  let additionalEvidenceUploadPage: AdditionalEvidenceUploadPage;
  let additionalEvidencePostPage: AdditionalEvidencePostPage;
  let additionalEvidenceCoversheetPage: AdditionalEvidenceCoversheetPage;
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
    additionalEvidencePage = new AdditionalEvidencePage(page);
    additionalEvidenceStatementPage = new AdditionalEvidenceStatementPage(page);
    additionalEvidenceConfirmationPage = new AdditionalEvidenceConfirmationPage(page);
    additionalEvidenceUploadPage = new AdditionalEvidenceUploadPage(page);
    additionalEvidencePostPage = new AdditionalEvidencePostPage(page);
    additionalEvidenceCoversheetPage = new AdditionalEvidenceCoversheetPage(page);
    taskListPage = new TaskListPage(page);
    await loginPage.visitPage(`?tya=${appellantTya}`);
    await loginPage.login(sidamUser.email || 'oral.appealReceived@example.com', sidamUser.password || '');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('CY - navigate to additional evidence page', async () => {
    await assignCasePage.clickLanguageToggle();
    await page.reload();
    assignCasePage.verifyPage();
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    statusPage.verifyPage();
    await additionalEvidencePage.visitPage();
  });

  it('CY - Verify additional evidence options', async () => {
    additionalEvidencePage.verifyPage();

    const header = await additionalEvidencePage.getElementText('h1');
    expect(header).to.equal(content.cy.additionalEvidence.evidenceOptions.header);
    const options = await additionalEvidencePage.getElementsValues("input[name='additional-evidence-option']");
    options.forEach(option => {
      expect(allowedActions).to.contain(option);
    });
  });

  it('CY - fills a statement and submit and shows confirmation page and returns to appeal page', async () => {
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
  it('CY - checks /task-list passes @pa11y', async () => {
    await taskListPage.visitPage();
    pa11yOpts.page = taskListPage.page;
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-task-list.png`;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('CY - checks /additional-evidence page path passes @pa11y', async () => {
    await additionalEvidencePage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-additional-evidence-page.png`;
    pa11yOpts.page = await additionalEvidencePage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('CY - checks /additional-evidence-upload page path passes @pa11y', async () => {
    await additionalEvidenceUploadPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-additional-evidence-upload-page.png`;
    pa11yOpts.page = await additionalEvidenceUploadPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('CY - checks /additional-evidence/statement page path passes @pa11y', async () => {
    await additionalEvidenceStatementPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-additional-evidence-statement-page.png`;
    pa11yOpts.page = additionalEvidenceStatementPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('CY - checks /additional-evidence/post page path passes @pa11y', async () => {
    await additionalEvidencePostPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-additional-evidence-post-page.png`;
    pa11yOpts.page = additionalEvidencePostPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('CY - shows an error if no file to upload and no description', async () => {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    await additionalEvidenceUploadPage.submit();
    expect(await additionalEvidenceUploadPage.getElementText('div.govuk-error-summary')).contain(content.cy.additionalEvidence.evidenceUpload.error.emptyDescription);
    expect(await additionalEvidenceUploadPage.getElementText('div.govuk-error-summary')).contain(content.cy.additionalEvidence.evidenceUpload.error.noFilesUploaded);
  });

  it('CY - shows an error if no file to upload', async () => {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    await additionalEvidenceUploadPage.addDescription('The evidence description');
    await additionalEvidenceUploadPage.submit();
    expect(await additionalEvidenceUploadPage.getElementText('div.govuk-error-summary')).contain(content.cy.additionalEvidence.evidenceUpload.error.noFilesUploaded);
  });

  it('CY - uploads a file and shows file list and check evidence confirmation page @pally', async () => {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();
    await page.waitFor(4000);
    expect(await additionalEvidenceUploadPage.getHeading()).to.equal(content.cy.additionalEvidence.evidenceUpload.header);

    await additionalEvidenceUploadPage.selectFile('evidence.txt');
    await additionalEvidenceUploadPage.submit();
    expect(await additionalEvidenceUploadPage.getHeading()).to.equal(content.cy.additionalEvidence.evidenceUpload.header);

    await additionalEvidenceUploadPage.addDescription('The evidence description');
    await additionalEvidenceUploadPage.submit();
    await page.waitFor(4000);

    /* PA11Y */
    additionalEvidenceConfirmationPage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-additional-evidence-confirmation-page.png`;
    pa11yOpts.page = await additionalEvidenceConfirmationPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));

    await additionalEvidenceConfirmationPage.returnToAppealPage();
    taskListPage.verifyPage();
  });

  it('CY - shows additional evidence post page', async () => {
    await additionalEvidencePage.visitPage();
    await additionalEvidencePage.selectPostOption();
    await additionalEvidencePage.submit();
    additionalEvidencePostPage.verifyPage();
  });
});
