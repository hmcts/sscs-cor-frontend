const { expect } = require('test/chai-sinon');
import { CONST } from 'app/constants';
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
import { TribunalViewAcceptedPage } from 'test/page-objects/tribunal-view-accepted';
import * as moment from 'moment';
const i18n = require('locale/en');

describe('Tribunal view page', () => {
  let page: Page;
  let tribunalViewPage;
  let tribunalViewAcceptedPage;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
    page = res.page;
    tribunalViewPage = new TribunalViewPage(page);
    tribunalViewAcceptedPage = new TribunalViewAcceptedPage(page);
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

  it('shows reasons for the tribunal\'s view', async() => {
    const reasonHeader = await tribunalViewPage.getElementText('#decision-reason h2');
    expect(reasonHeader).to.equal(i18n.tribunalView.reasonsHeader);
    const reasons = await tribunalViewPage.getElementText('#decision-text');
    expect(reasons).to.not.be.null;
  });

  it('shows the accept/rejects view options with deadline', async() => {
    const acceptYes = await tribunalViewPage.getElementValue('#accept-view-1');
    expect(acceptYes).to.equal('yes')
    const acceptNo = await tribunalViewPage.getElementValue('#accept-view-2');
    expect(acceptNo).to.equal('no')
    const respondBy = await tribunalViewPage.getElementText('form p');
    expect(respondBy).to.contain(`${moment().utc().add(7, 'day').format(CONST.DATE_FORMAT)}`);
  });

  it('validates that one option must be selected', async() => {
    await tribunalViewPage.submit();
    expect(await tribunalViewPage.getElementText('.govuk-error-summary')).contain(i18n.tribunalView.error.empty);
    expect(await tribunalViewPage.getElementText('#accept-view-error')).equal(i18n.tribunalView.error.empty);
  });

  describe('accepting the tribunal\'s view', () => {
    it('shows the accepts page', async() => {
      await tribunalViewPage.acceptTribunalsView();
      await tribunalViewPage.submit();
      tribunalViewAcceptedPage.verifyPage();
      expect(await tribunalViewAcceptedPage.getHeading()).to.equal(i18n.tribunalViewAccepted.header);
    });
  });

  describe('requesting a hearing', () => {
    it('shows the hearing confirm page');
  });
});
