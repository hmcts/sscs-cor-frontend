import { Page } from 'puppeteer';

const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { AdditionalEvidencePage } from 'test/page-objects/additional-evidence';
import { allowedActions } from 'app/server/controllers/additional-evidence';
const i18n = require('locale/en');

describe('Additional Evidence', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let additionalEvidencePage: AdditionalEvidencePage;
  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true });
    page = res.page;
    taskListPage = new TaskListPage(page);
    additionalEvidencePage = new AdditionalEvidencePage(page);
    await taskListPage.visitPage();
    await taskListPage.clickElement('#evidence-options-link');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the evidence options page', () => {
    additionalEvidencePage.verifyPage();
  });

  it('shows additional evidence options', async () => {
    const header = await additionalEvidencePage.getElementText('h1');
    expect(header).to.equal(i18n.additionalEvidence.evidenceOptions.header);

    const options = await additionalEvidencePage.getElementsValues("input[name='additional-evidence-option']");

    options.forEach(option => {
      expect(allowedActions).to.contain(option);
    });
  });
});
