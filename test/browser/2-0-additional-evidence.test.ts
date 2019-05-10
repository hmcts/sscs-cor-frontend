import { Page } from 'puppeteer';
const config = require('config');

import * as Paths from 'app/server/paths';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { AdditionalEvidencePage } from 'test/page-objects/additional-evidence';
import { allowedActions } from 'app/server/controllers/additional-evidence';
import { AdditionalEvidenceStatementPage } from 'test/page-objects/additional-evidence-statement';
import { AdditionalEvidenceConfirmationPage } from 'test/page-objects/additional-evidence-confirmation';
import { AdditionalEvidenceUploadPage } from 'test/page-objects/additional-evidence-upload';
const i18n = require('locale/en');

const testUrl = config.get('testUrl');

describe('Additional Evidence', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let additionalEvidencePage: AdditionalEvidencePage;
  let additionalEvidenceStatementPage: AdditionalEvidenceStatementPage;
  let additionalEvidenceConfirmationPage: AdditionalEvidenceConfirmationPage;
  let additionalEvidenceUploadPage: AdditionalEvidenceUploadPage;
  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true });
    page = res.page;
    taskListPage = new TaskListPage(page);
    await taskListPage.setCookie('additionalEvidence', 'true');
    additionalEvidencePage = new AdditionalEvidencePage(page);
    additionalEvidenceStatementPage = new AdditionalEvidenceStatementPage(page);
    additionalEvidenceConfirmationPage = new AdditionalEvidenceConfirmationPage(page);
    additionalEvidenceUploadPage = new AdditionalEvidenceUploadPage(page);
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  beforeEach(async () => {
    await taskListPage.visitPage();
    await Promise.all([
      taskListPage.clickElement('#evidence-options-link'),
      taskListPage.page.waitForNavigation()
    ]);
  });

  it('navigates to additional evidence page and shows options', async () => {
    additionalEvidencePage.verifyPage();

    const header = await additionalEvidencePage.getElementText('h1');
    expect(header).to.equal(i18n.additionalEvidence.evidenceOptions.header);
    const options = await additionalEvidencePage.getElementsValues("input[name='additional-evidence-option']");
    options.forEach(option => {
      expect(allowedActions).to.contain(option);
    });
  });

  it('fills a statement and submit and shows confirmation page', async () => {
    // await page.waitFor(4000);
    additionalEvidencePage.verifyPage();
    await additionalEvidencePage.selectStatementOption();
    await additionalEvidencePage.submit();

    additionalEvidenceStatementPage.verifyPage();
  });

  it('uploads a file and shows file list', async () => {
    additionalEvidencePage.verifyPage();
    await additionalEvidencePage.selectUploadOption();
    await additionalEvidencePage.submit();

    additionalEvidenceUploadPage.verifyPage();

    expect(await additionalEvidenceUploadPage.getHeading()).to.equal(i18n.additionalEvidence.evidenceUpload.header);
  });
});
