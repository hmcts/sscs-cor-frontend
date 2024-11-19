import { Page } from 'puppeteer';

import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';
import * as config from 'config';

describe('Manage your appeal app @smoke', function () {
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
    const appellantTya = ccdCase.hasOwnProperty('appellant_tya')
      ? ccdCase.appellant_tya
      : 'anId';
    loginPage = new LoginPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
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

  it('should land in assign-case page after a successful login', async function () {
    assignCasePage.verifyPage();
  });

  it('should inform postcode, submit and land in status page', async function () {
    if (config.get('featureFlags.allowContactUs.ibcaEnabled')) {
      await assignCasePage.fillAppealType('otherBenefits');
    }
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    statusPage.verifyPage();
  });

  describe('Status page', function () {
    it('should display navigation tabs and Status tab should be active', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.navigation-tabs')).to.not.be
        .null;
      expect(
        await statusPage.getElementText('.govuk-tabs__list-item--selected')
      ).contain(content.en.statusTab.tabHeader);
    });

    it('should display subheading', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(
        content.en.statusTab.header
      );
    });

    it('should display status bar', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.task-list h2')).to.equal(
        content.en.statusTab.header
      );
    });

    it('should display panel with latest update', async function () {
      statusPage.verifyPage();
      expect(await statusPage.getElementText('.panel')).contain(
        content.en.statusTab.panelHeader
      );
    });

    it('should display Help and Support links', async function () {
      statusPage.verifyPage();
      expect(
        await statusPage.getElementText('.mya-contact__content h2')
      ).to.equal(content.en.helpGuides.header);
      expect(
        await statusPage.getElementText('.mya-contact__content .govuk-list')
      ).contain(content.en.helpGuides.representatives.linkHeader);
      expect(
        await statusPage.getElementText('.mya-contact__content .govuk-list')
      ).contain(content.en.helpGuides.withdrawAppeal.linkHeader);
    });

    it('should display Contact us for help options and open details', async function () {
      statusPage.verifyPage();
      expect(
        await statusPage.getElementText('.govuk-details.contact-us')
      ).to.equal(content.en.contactUs.title);
      const elementHandle = await page.$('.govuk-details.contact-us');
      const heightClosed = await page.evaluate((element) => {
        const { height } = element.getBoundingClientRect();
        return height;
      }, elementHandle);

      expect(heightClosed).to.equal(40);
    });
  });
});
