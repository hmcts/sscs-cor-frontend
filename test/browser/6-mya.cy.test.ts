import { Page } from 'puppeteer';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import { AppealDetailsPage } from '../page-objects/appeal-details';
import { HearingPage } from 'test/page-objects/hearing';
import { AudioVideoEvidencePage } from 'test/page-objects/audio-video-evidence';
import { SupportEvidencePage } from 'test/page-objects/support-evidence';
import { RepresentativesPage } from 'test/page-objects/representatives';
import { SupportHearingPage } from 'test/page-objects/support-hearing';
import { ClaimingExpensesPage } from 'test/page-objects/claiming-expenses';
import { WithdrawAppealPage } from 'test/page-objects/withdraw-appeal';
import * as _ from 'lodash';
const content = require('locale/content');
const config = require('config');
const pa11y = require('pa11y');
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
let pa11yOpts = _.clone(config.get('pa11y'));

describe('Welsh Manage your appeal app @mya @nightly', () => {
  let ccdCase;
  let page: Page;
  let loginPage: LoginPage;
  let assignCasePage: AssignCasePage;
  let appealDetailsPage: AppealDetailsPage;
  let statusPage: StatusPage;
  let hearingPage: HearingPage;
  let audioVideoEvidencePage: AudioVideoEvidencePage;
  let supportEvidencePage: SupportEvidencePage;
  let representativesPage: RepresentativesPage;
  let supportHearingPage: SupportHearingPage;
  let claimingExpensesPage: ClaimingExpensesPage;
  let withdrawAppealPage: WithdrawAppealPage;
  let sidamUser;

  before(async () => {
    ({ ccdCase, page, sidamUser = {} } = await startServices({ bootstrapData: true, hearingType: 'oral' }));
    const appellantTya = ccdCase.hasOwnProperty('appellant_tya') ? ccdCase.appellant_tya : 'anId';
    pa11yOpts.browser = page.browser;
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    appealDetailsPage = new AppealDetailsPage(page);
    hearingPage = new HearingPage(page);
    audioVideoEvidencePage = new AudioVideoEvidencePage(page);
    supportEvidencePage = new SupportEvidencePage(page);
    representativesPage = new RepresentativesPage(page);
    supportHearingPage = new SupportHearingPage(page);
    claimingExpensesPage = new ClaimingExpensesPage(page);
    withdrawAppealPage = new WithdrawAppealPage(page);
    await loginPage.setCookie('welsh', 'true');
    await loginPage.visitPage(`?tya=${appellantTya}`);
    await loginPage.login(sidamUser.email || 'oral.appealReceived@example.com', sidamUser.password || '');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  /* PA11Y */
  it('CY:checks postcode page path passes @pa11y', async () => {
    await assignCasePage.clickLanguageToggle();
    await page.reload();
    assignCasePage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-postcode-page.png`;
    pa11yOpts.page = assignCasePage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('CY:should inform postcode, submit and land in status page', async() => {
    await page.waitFor('*');
    await page.waitForSelector('.govuk-link.language', {
      visible: true
    });
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();
    await page.reload();
    statusPage.verifyPage();
  });

  describe('CY:Status page', () => {
    it('should display navigation tabs and Status tab should be active', async() => {
      await statusPage.visitPage();
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.navigation-tabs')).to.not.be.null;
      expect(await statusPage.getElementText('.navigation-tabs ul li.selected')).contain(content.cy.statusTab.tabHeader);
    });

    it('CY:should display subheading', async() => {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(content.cy.statusTab.header);
    });

    it('CY:should display status bar', async() => {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(content.cy.statusTab.header);
    });

    it('CY:should display panel with latest update', async() => {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.panel')).contain(content.cy.statusTab.panelHeader);
    });

    it('CY:should display Help and Support links', async() => {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.mya-contact__content h2')).to.equal(content.cy.helpGuides.header);
      expect(await statusPage.getElementText('.mya-contact__content .govuk-list')).contain(content.cy.helpGuides.representatives.linkHeader);
      expect(await statusPage.getElementText('.mya-contact__content .govuk-list')).contain(content.cy.helpGuides.withdrawAppeal.linkHeader);
    });

    it('CY:should display Contact us for help options and open details', async() => {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.govuk-details.contact-us')).to.equal(content.cy.contactUs.title);
      const elementHandle = await page.$('.govuk-details.contact-us');
      const heightClosed = await page.evaluate(element => {
        const { height } = element.getBoundingClientRect();
        return height;
      }, elementHandle);

      expect(heightClosed).to.equal(40);
    });

    it('CY:should open Contact us details', async() => {
      statusPage.verifyPage();
      const elementHandle = await page.$('.govuk-details.contact-us');
      await statusPage.openDetails('.govuk-details.contact-us');
      const heightOpen = await page.evaluate(element => {
        const { height } = element.getBoundingClientRect();
        return height;
      }, elementHandle);

      expect(heightOpen).to.equal(490);
    });
  });

  /* PA11Y */
  it('CY:checks /status page path passes @pa11y', async () => {
    statusPage.verifyPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-status-page.png`;
    pa11yOpts.page = await statusPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('checks /support-evidence page passes @pa11y', async () => {
    await supportEvidencePage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-support-evidence-page.png`;
    pa11yOpts.page = await supportEvidencePage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('checks /representatives page passes @pa11y', async () => {
    await representativesPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-representatives-page.png`;
    pa11yOpts.page = await representativesPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('checks /support-hearing page passes @pa11y', async () => {
    await supportHearingPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-support-hearing-page.png`;
    pa11yOpts.page = await supportHearingPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('checks /claiming-expenses page passes @pa11y', async () => {
    await claimingExpensesPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-claiming-expenses-page.png`;
    pa11yOpts.page = await claimingExpensesPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  /* PA11Y */
  it('checks /withdraw-appeal page passes @pa11y', async () => {
    await withdrawAppealPage.visitPage();
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-withdraw-appeal-page.png`;
    pa11yOpts.page = await withdrawAppealPage.page;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  describe('CY - Hearing page', () => {
    it('CY - Navigate to hearing tab', async() => {
      statusPage.verifyPage();
      await statusPage.clickElement('#tab-hearing');
      await page.waitFor(500);
      expect(await statusPage.getElementText('.navigation-tabs ul li.selected')).contain(content.cy.hearingTab.tabHeader);
    });
    /* PA11Y */
    it('checks /hearing page passes @pa11y', async () => {
      hearingPage.verifyPage();
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-hearing-page.png`;
      pa11yOpts.page = await hearingPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });

  describe('CY - Audio/video Evidence page', () => {
    it('CY - Navigate to Audio/Video Evidence tab', async() => {
      await statusPage.clickElement('#tab-avEvidence');
      await page.waitFor(500);

      expect(await statusPage.getElementText('.navigation-tabs ul li.selected')).contain(content.cy.avEvidenceTab.tabHeader);
      expect(await statusPage.getElementText('.task-list div div')).contain(content.cy.avEvidenceTab.noEvidence);
    });
    /* PA11Y */
    // it('checks /audio-video-evidence page passes @wip @pa11y', async () => {
    //   audioVideoEvidencePage.verifyPage();
    //   pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-audio-video-evidence-page.png`;
    //   pa11yOpts.page = await audioVideoEvidencePage.page;
    //   const result = await pa11y(pa11yOpts);
    //   expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    // });
  });

  describe('CY - Appeal Details page', () => {
    it('CY - Navigate to Appeal Details page', async() => {
      await statusPage.navigateToAppealDetailsPage();
      await page.waitFor(500);

      expect(await appealDetailsPage.getElementText('.govuk-heading-xl')).contain(content.cy.yourDetails.header);
      expect(await appealDetailsPage.getElementText('.govuk-table .govuk-table__body')).contain('TN32 6PL');
      expect(await appealDetailsPage.getElementText('.govuk-table .govuk-table__body')).contain('joe@bloggs.com');
    });
    /* PA11Y */
    it('Navigate to Appeal Details page @pa11y', async () => {
      appealDetailsPage.verifyPage();
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/cy-appeal-details-page.png`;
      pa11yOpts.page = appealDetailsPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });
});
