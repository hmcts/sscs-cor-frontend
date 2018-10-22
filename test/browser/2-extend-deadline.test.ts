import * as moment from 'moment';
import * as _ from 'lodash';
import { CONST } from 'app/constants';
const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
const i18n = require('locale/en');

import { ExtendDeadlinePage } from 'test/page-objects/extend-deadline';
const config = require('config');

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));

const testUrl = config.get('testUrl');

describe('Extend deadline', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let extendDeadlinePage: ExtendDeadlinePage;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true });
    page = res.page;
    taskListPage = new TaskListPage(page);
    extendDeadlinePage = new ExtendDeadlinePage(page);
    pa11yOpts.browser = res.browser;
    pa11yOpts.page = extendDeadlinePage.page;
    await taskListPage.clickExtend();
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /extend-deadline path', async () => {
    extendDeadlinePage.verifyPage();
  });

  /* PA11Y */
  it('checks /extend-deadline passes @pa11y', async () => {
    pa11yOpts.screenCapture = `./functional-output/extend-deadline.png`;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('displays contact for help', async () => {
    const contactHelpLink = 'summary.govuk-details__summary span';
    const contactHelpLinkText = await extendDeadlinePage.getElementText(contactHelpLink);
    expect(contactHelpLinkText).to.equal(i18n.contact.summary);
  });

  it('displays an error message in the summary when you try to continue without selecting an option', async () => {
    await extendDeadlinePage.submit();
    expect(await extendDeadlinePage.getElementText('.govuk-error-summary'))
      .to.contain(i18n.errorSummary.titleText);
    expect(await extendDeadlinePage.getElementText('.govuk-error-summary__list'))
      .to.contain(i18n.extendDeadline.error.text);
  });

  describe('confirming no', () => {
    before('go to extend deadline   page', async () => {
      await extendDeadlinePage.visitPage();
      await extendDeadlinePage.clickNo();
      await extendDeadlinePage.submit();
    });

    it('shows the confirmation page with existing deadline', async () => {
      const deadline = await extendDeadlinePage.getElementText('#extend-message');
      expect(deadline).to.contain(`${moment.utc().add(7, 'day').format(CONST.DATE_FORMAT)}`);
    });

    /* PA11Y */
    it('checks the confirmation page with existing deadline passes @pa11y', async () => {
      pa11yOpts.screenCapture = `./functional-output/extend-deadline-confirmation-no.png`;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });

  describe('confirming yes', () => {
    before('go to extend page and select yes', async () => {
      await taskListPage.visitPage();
      await taskListPage.clickExtend();
      await extendDeadlinePage.clickYes();
      await extendDeadlinePage.submit();
    });

    it('shows the confirmation page with new deadline', async () => {
      const deadline = await extendDeadlinePage.getElementText('#extend-message');
      expect(deadline).to.contain(`${moment.utc().add(14, 'day').format(CONST.DATE_FORMAT)}`);
    });

    /* PA11Y */
    it('checks the confirmation page with existing deadline passes @pa11y', async () => {
      pa11yOpts.screenCapture = `./functional-output/extend-deadline-confirmation-yes.png`;
      const result = await pa11y('', pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });

  describe('trying to extend deadline a second time', () => {
    before('go to the extend page', async () => {
      await taskListPage.visitPage();
      await taskListPage.clickExtend();
    });

    it('shows the contact tribunal details if tyring for second extension', async () => {
      const heading = await extendDeadlinePage.getElementText('.govuk-main-wrapper h1');
      expect(heading).to.equal(i18n.extendDeadline.contactTribunal.header);
    });

    /* PA11Y */
    it('checks the contact tribunal details if tyring for second extension passes @pa11y', async () => {
      pa11yOpts.screenCapture = `./functional-output/extend-deadline-contact-tribunal.png`;
      const result = await pa11y(`${testUrl}${extendDeadlinePage.pagePath}`, pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });
});

export { };
