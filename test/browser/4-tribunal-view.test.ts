const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
const i18n = require('locale/en');

describe('Tribunal view page', () => {
  let page: Page;
  let tribunalViewPage;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
    page = res.page;
    tribunalViewPage = new TribunalViewPage(page);
    await tribunalViewPage.screenshot('tribunal-view-issued');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /tribunal-view path', async() => {
    tribunalViewPage.verifyPage();
  });

  it('shows reasons', async() => {
    const reasonHeader = await tribunalViewPage.getElementText('#decision-reason h2');
    expect(reasonHeader).to.equal(i18n.tribunalView.reasonsHeader);
    const reasons = await tribunalViewPage.getElementText('#decision-text');
    expect(reasons).to.not.be.null;
  });
});
