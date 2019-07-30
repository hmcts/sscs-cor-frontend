import { Page } from 'puppeteer';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
import { AssignCasePage } from 'test/page-objects/assign-case';

describe('Manage your appeal app @mya', () => {
  let ccdCase;
  let page: Page;
  let loginPage: LoginPage;
  let taskListPage: TaskListPage;
  let assignCasePage: AssignCasePage;
  let sidamUser;
  before(async () => {
    ({ ccdCase, page, sidamUser = {} } = await startServices({ bootstrapData: true }));
    loginPage = new LoginPage(page);
    taskListPage = new TaskListPage(page);
    assignCasePage = new AssignCasePage(page);
    await taskListPage.setCookie('manageYourAppeal', 'true');

    await loginPage.visitPage(`?tya=asdfasdf`);
    await loginPage.login(sidamUser.email || '', sidamUser.password || '');
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('should land in status page after a successful login', async() => {
    assignCasePage.verifyPage();
  });
});
