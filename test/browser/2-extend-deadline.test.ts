import { CONST } from 'app/constants';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { TaskListPage } from 'test/page-objects/task-list';
import { ExtendIndexPage } from 'test/page-objects/extend-deadline';
const i18n = require('app/server/locale/en');
import * as Paths from 'app/server/paths';
const config = require('config');
import * as moment from 'moment';

const testUrl = config.get('testUrl');

describe('Extend deadline', () => {
  let page;
  let taskListPage: TaskListPage;
  let extendDeadlinePage: ExtendIndexPage;


  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true });
    page = res.page;
    
    taskListPage = new TaskListPage(page);
    extendDeadlinePage = new ExtendIndexPage(page);
    
    await taskListPage.clickExtend();    
    await extendDeadlinePage.screenshot('extend-deadline');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /extend-deadline path', () => {
    extendDeadlinePage.verifyPage();
  });
  
  it('displays contact for help', async() => {
    const contactHelpLink = 'summary.govuk-details__summary span';
    const contactHelpLinkText = await extendDeadlinePage.getElementText(contactHelpLink);
    expect(contactHelpLinkText).to.equal(i18n.contact.summary);
  });

  it('displays an error message in the summary when you try to continue without selecting an option', async() => {
    await extendDeadlinePage.continue();
    expect(await extendDeadlinePage.getElementText('.govuk-error-summary'))
      .to.contain(i18n.extendDeadline.error.title);
    expect(await extendDeadlinePage.getElementText('.govuk-error-summary__list'))
      .to.contain(i18n.extendDeadline.error.text);
  });

  describe('confirming no', () => {
    it('shows the confirmation page with exisint deadline', async() => {
      await extendDeadlinePage.clickNo();
      await extendDeadlinePage.continue();
      await extendDeadlinePage.screenshot('extend-deadline-confirmation-no');

      const deadline = await extendDeadlinePage.getElementText('#extend-message');
      expect(deadline).to.contain(`${moment().utc().add(7, 'day').format(CONST.DATE_FORMAT)}`);
    });
  });

  describe('confirming yes', () => {
    it('shows the confirmation page with exising deadline', async() => {
      await page.goto(`${testUrl}${Paths.extendDeadline}`);
      await extendDeadlinePage.clickYes();
      await extendDeadlinePage.continue();
      await extendDeadlinePage.screenshot('extend-deadline-confirmation-yes');

      const deadline = await extendDeadlinePage.getElementText('#extend-message');
      expect(deadline).to.contain(`${moment().utc().add(14, 'day').format(CONST.DATE_FORMAT)}`);
    });

    it('shows the contact tribunal details', async() => {
      await page.goto(`${testUrl}${Paths.taskList}`);
      await taskListPage.clickExtend();  
      await extendDeadlinePage.screenshot('extend-deadline-contact-tribunal');

      const heading = await extendDeadlinePage.getElementText('.govuk-main-wrapper h1');
      expect(heading).to.equal(i18n.extendDeadline.contactTribunal.header);
    });
  });
});

export {};