import { Page } from 'puppeteer';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
import { AssignCasePage } from 'test/page-objects/assign-case';
import { StatusPage } from 'test/page-objects/status';

describe('Manage your appeal app @mya', () => {
  let ccdCase;
  let page: Page;
  let loginPage: LoginPage;
  let taskListPage: TaskListPage;
  let assignCasePage: AssignCasePage;
  let statusPage: StatusPage;
  let sidamUser;
  before(async () => {
    ({ ccdCase, page, sidamUser = {} } = await startServices({ bootstrapData: true }));
    console.log('ccdCase', JSON.stringify(ccdCase));
    const appellantTya = ccdCase.hasOwnProperty('appellant_tya') ? ccdCase.appellant_tya : 'anId';
    loginPage = new LoginPage(page);
    taskListPage = new TaskListPage(page);
    assignCasePage = new AssignCasePage(page);
    statusPage = new StatusPage(page);
    await taskListPage.setCookie('manageYourAppeal', 'true');

    await loginPage.visitPage(`?tya=${appellantTya}`);
    await loginPage.login(sidamUser.email || '', sidamUser.password || '');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('should land in assign-case page after a successful login', async() => {
    assignCasePage.verifyPage();
  });

  it('should inform postcode, submit and land in status page', async() => {
    await assignCasePage.fillPostcode('TN32 6PL');
    await assignCasePage.submit();

    statusPage.verifyPage();
  });
});
