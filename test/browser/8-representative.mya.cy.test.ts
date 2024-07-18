import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
import { expect } from 'test/chai-sinon';
import config from 'config';
import pa11y from 'pa11y';
import content from 'app/common/locale/content.json';

const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
const pa11yOpts = _.clone(config.get('pa11y'));

describe('CY - Representative - Manage your appeal app @mya @nightly', function () {
  let ccdCase;
  let page: Page;
  let loginPage: LoginPage;
  let assignCasePage: AssignCasePage;
  let statusPage: StatusPage;
  let sidamUser;
  before(async function () {
    ({
      ccdCase,
      page,
      sidamUser = {},
    } = await startServices({ bootstrapData: true, hearingType: 'oral' }));
    const representativeTya = ccdCase.hasOwnProperty('representative_tya')
      ? ccdCase.representative_tya
      : 'anId';
    pa11yOpts.browser = page.browser;
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    await loginPage.setCookie('welsh', 'true');
    await loginPage.visitPage(`?tya=${representativeTya}`);
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

  it('CY -Representative should land in assign-case page after a successful login', async function () {
    logger.info(`Before language toggle - Page URL: ${this.page.url()}`);
    await assignCasePage.clickLanguageToggle();
    logger.info(`Before reload - Page URL: ${this.page.url()}`);
    await page.reload();
    logger.info(`Before verifyPage - Page URL: ${this.page.url()}`);
    assignCasePage.verifyPage();
    logger.info(`Before verifyLanguage - Page URL: ${this.page.url()}`);
    assignCasePage.verifyLanguage('cy');
  });

  it('CY - Representative should inform postcode, submit and land in status page', async function () {
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    await page.reload();
    statusPage.verifyPage();
  });

  describe('CY - Representative Status page', function () {
    it('CY - should display navigation tabs and Status tab should be active', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.navigation-tabs')).to.not.be
        .null;
      expect(
        await statusPage.getElementText('.govuk-tabs__list-item--selected')
      ).contain(content.cy.statusTab.tabHeader);
    });

    it('CY - should display subheading', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(
        content.cy.statusTab.header
      );
    });

    it('CY - should display status bar', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(
        content.cy.statusTab.header
      );
    });

    it('CY - should display panel with latest update', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.panel')).contain(
        content.cy.statusTab.panelHeader
      );
    });

    it('CY- should display Help and Support links', async function () {
      statusPage.verifyPage();
      expect(
        await statusPage.getElementText('.mya-contact__content h2')
      ).to.equal(content.cy.helpGuides.header);
      expect(
        await statusPage.getElementText('.mya-contact__content .govuk-list')
      ).contain(content.cy.helpGuides.representatives.linkHeader);
      expect(
        await statusPage.getElementText('.mya-contact__content .govuk-list')
      ).contain(content.cy.helpGuides.withdrawAppeal.linkHeader);
    });

    it('CY -should display Contact us for help options and open details', async function () {
      statusPage.verifyPage();
      expect(
        await statusPage.getElementText('.govuk-details.contact-us')
      ).to.equal(content.cy.contactUs.title);
      const elementHandle = await page.$('.govuk-details.contact-us');
      const heightClosed = await page.evaluate((element) => {
        const { height } = element.getBoundingClientRect();
        return height;
      }, elementHandle);

      expect(heightClosed).to.equal(40);
    });

    it('CY - should open Contact us details', async function () {
      statusPage.verifyPage();
      const elementHandle = await page.$('.govuk-details.contact-us');
      await statusPage.openDetails('.govuk-details.contact-us');
      const heightOpen = await page.evaluate((element) => {
        const { height } = element.getBoundingClientRect();
        return height;
      }, elementHandle);

      expect(heightOpen).to.equal(465);
    });
  });
});
