import * as moment from 'moment';
import * as _ from 'lodash';
const { expect } = require('test/chai-sinon');
import { CONST } from 'app/constants';
import { Page } from 'puppeteer';
import { startServices, login } from 'test/browser/common';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
import { TribunalViewAcceptedPage } from 'test/page-objects/tribunal-view-accepted';
import { TribunalViewConfirmPage } from 'test/page-objects/tribunal-view-confirm';
const i18n = require('locale/en');
const config = require('config');

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');

describe('Tribunal view page', () => {
  let page: Page;
  let tribunalViewPage: TribunalViewPage;
  let tribunalViewAcceptedPage: TribunalViewAcceptedPage;
  let tribunalViewConfirmPage: TribunalViewConfirmPage;
  let browser;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true, forceLogin: true, issueDecision: true });
    page = res.page;
    browser = res.browser;
    pa11yOpts.browser = browser;
    tribunalViewPage = new TribunalViewPage(page);
    tribunalViewAcceptedPage = new TribunalViewAcceptedPage(page);
    tribunalViewConfirmPage = new TribunalViewConfirmPage(page);
    await tribunalViewPage.screenshot('tribunal-view-issued');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /tribunal-view path', async () => {
    tribunalViewPage.verifyPage();
  });

  /* PA11Y */
  it('checks /tribunal-view passes @pa11y', async () => {
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/view.png`;
    pa11yOpts.page = tribunalViewPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('shows reasons for the tribunal\'s view', async () => {
    const reasonHeader = await tribunalViewPage.getElementText('#decision-reason h2');
    expect(reasonHeader).to.equal(i18n.tribunalView.reasonsHeader);
    const reasons = await tribunalViewPage.getElementText('#decision-text');
    expect(reasons).to.not.be.null;
  });

  it('shows the accept/rejects view options with deadline', async () => {
    const acceptYes = await tribunalViewPage.getElementValue('#accept-view-1');
    expect(acceptYes).to.equal('yes');
    const acceptNo = await tribunalViewPage.getElementValue('#accept-view-2');
    expect(acceptNo).to.equal('no');
    const respondBy = await tribunalViewPage.getElementText('form p');
    expect(respondBy).to.contain(`${moment.utc().add(7, 'day').format(CONST.DATE_FORMAT)}`);
  });

  it('validates that one option must be selected', async () => {
    await tribunalViewPage.submit();
    expect(await tribunalViewPage.getElementText('.govuk-error-summary')).contain(i18n.tribunalView.error.empty);
    expect(await tribunalViewPage.getElementText('#accept-view-error')).equal(i18n.tribunalView.error.empty);
  });

  describe('accepting the tribunal\'s view shows the accepts page', () => {
    it('is on the /tribunal-view path', async () => {
      tribunalViewPage.verifyPage();
    });

    /* PA11Y */
    it('checks /tribunal-view-confirm passes @pa11y', async () => {
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/view-confirm.png`;
      pa11yOpts.page = tribunalViewConfirmPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });

    it('accept tribunal view and shows confirming page', async () => {
      await tribunalViewPage.acceptTribunalsView();
      await tribunalViewPage.submit();

      tribunalViewConfirmPage.verifyPage();
      expect(await tribunalViewConfirmPage.getHeading()).to.equal(i18n.tribunalViewConfirm.header);
    });

    it('confirms view and shows tribunal accepted', async () => {
      await tribunalViewConfirmPage.acceptTribunalsView();
      await tribunalViewConfirmPage.submit();

      tribunalViewAcceptedPage.verifyPage();
      expect(await tribunalViewAcceptedPage.getHeading()).to.equal(i18n.tribunalViewAccepted.header);

    });

    it('returns the user to the acceptance page if they sign-in later', async () => {
      await login(page);
      tribunalViewAcceptedPage.verifyPage();
      expect(await tribunalViewAcceptedPage.getHeading()).to.equal(i18n.tribunalViewAccepted.header);
    });
  });

});
