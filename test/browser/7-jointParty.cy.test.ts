import { Page } from 'puppeteer';
import { CY_CONTACT_US_OPEN_HEIGHT, startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
import { expect } from 'test/chai-sinon';
import config from 'config';
import content from 'app/common/locale/content.json';

const pa11yOpts = _.clone(config.get('pa11y'));

describe('CY -Joint party - Manage your appeal app @mya @nightly', function () {
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
    const jointTya = ccdCase.hasOwnProperty('joint_party_tya')
      ? ccdCase.joint_party_tya
      : 'anId';
    pa11yOpts.browser = page.browser;
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    await loginPage.visitPage(`?tya=${jointTya}`);
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

  it('CY - Joint party should land in assign-case page after a successful login', async function () {
    await assignCasePage.clickLanguageToggle();
    await page.reload();
    assignCasePage.verifyPage();
    assignCasePage.verifyLanguage('cy');
  });

  it('CY - Joint party should inform postcode, submit and land in status page', async function () {
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    await page.reload();
    statusPage.verifyPage();
  });

  describe('CY - Joint party Status page', function () {
    it('should display navigation tabs and Status tab should be active', async function () {
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

    it('CY - should display Help and Support links', async function () {
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

    it('CY - should display Contact us for help options and open details', async function () {
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

      expect(heightOpen).to.equal(CY_CONTACT_US_OPEN_HEIGHT);
    });
  });
});
