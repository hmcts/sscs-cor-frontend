import { Page } from 'puppeteer';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';
import * as _ from 'lodash';
const content = require('locale/content');
const config = require('config');
const pa11y = require('pa11y');
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');
let pa11yOpts = _.clone(config.get('pa11y'));
let languages = ['en', 'cy'];
let ccdCase;
let page: Page;
let loginPage: LoginPage;
let assignCasePage: AssignCasePage;
let statusPage: StatusPage;
let sidamUser;

languages.forEach(language => {

  describe(`${language.toUpperCase()} - Representative - Manage your appeal app @mya`, async () => {

    it(`${language.toUpperCase()} - Representative should land in assign-case page after a successful login`, async() => {
      await loginToMYA(language);
      if (language === 'cy') {
        await assignCasePage.clickLanguageToggle();
        await page.reload();
      }
      assignCasePage.verifyPage();
    });

    /* PA11Y */
    it(`${language.toUpperCase()} - Representative checks /postcode page path passes @pa11y`, async () => {
      assignCasePage.verifyPage();
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/postcode-page.png`;
      pa11yOpts.page = assignCasePage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });

    it(`${language.toUpperCase()} - Representative should inform postcode, submit and land in status page`, async() => {
      await assignCasePage.fillPostcode('TN32 6PL');
      await assignCasePage.submit();

      statusPage.verifyPage();
    });

  /* PA11Y */
    it(`${language.toUpperCase()} - Representative checks /status page path passes @pa11y`, async () => {
      statusPage.verifyPage();
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/status-page.png`;
      pa11yOpts.page = await statusPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });
});

async function loginToMYA(language) {
  ({ ccdCase, page, sidamUser = {} } = await startServices({ bootstrapData: true, hearingType: 'oral' }));
  const representativeTya = ccdCase.hasOwnProperty('representative_tya') ? ccdCase.representative_tya : 'anId';
  pa11yOpts.browser = page.browser;
  loginPage = new LoginPage(page);
  assignCasePage = new AssignCasePage(page);
  statusPage = new StatusPage(page);
  if (language === 'en') {
    await loginPage.setCookie('manageYourAppeal', 'true');
  } else {
    await loginPage.setCookie('welsh', 'true');
  }
  await loginPage.visitPage(`?tya=${representativeTya}`);
  await loginPage.login(sidamUser.email || 'oral.appealReceived@example.com', sidamUser.password || '');
}
