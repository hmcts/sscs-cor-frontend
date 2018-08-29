const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/hearing').template;
const LoginPage = require('test/page-objects/login');
const TaskListPage = require('test/page-objects/task-list');
const i18n = require('app/locale/en');

describe('Login page', () => {
  let page;
  let loginPage;
  let taskListPage;

  before(async() => {
    const res = await startServices();
    page = res.page;
    loginPage = new LoginPage(page);
    taskListPage = new TaskListPage(page);
    await loginPage.visitPage();
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /login path with header', async() => {
    loginPage.verifyPage();
    expect(await loginPage.getHeading()).to.equal(i18n.login.header);
  });

  it('handles online hearing not found', async() => {
    await loginPage.login('not.found@example.com');
    loginPage.verifyPage();
    const errorSummary = await loginPage.getElementText('.govuk-error-summary');
    expect(errorSummary).contain(i18n.login.emailAddress.error.error404);
  });

  it('handles multiple online hearings found', async() => {
    await loginPage.login('multiple@example.com');
    loginPage.verifyPage();
    const errorSummary = await loginPage.getElementText('.govuk-error-summary');
    expect(errorSummary).contain(i18n.login.emailAddress.error.error422);
  });

  it('logs in successfully and show the task list', async() => {
    await loginPage.login('test@example.com');
    await loginPage.screenshot('successful-login');
    taskListPage.verifyPage();
    expect(await taskListPage.getHeading()).to.equal(i18n.taskList.header);
  });

  it('displays the appellant name and case reference', async() => {
    const appellantName = await taskListPage.getElementText('#appellant-name');
    const caseReference = await taskListPage.getElementText('#case-reference');
    expect(appellantName).to.equal(mockData.appellant_name);
    expect(caseReference).to.equal(mockData.case_reference);
  });
});

export {};
