const moment = require('moment');
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/hearing').template;
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
import { DecisionPage } from 'test/page-objects/decision';
const i18n = require('app/server/locale/en');

describe('Login page', () => {
  let page;
  let loginPage;
  let taskListPage;
  let decisionPage;

  before(async() => {
    const res = await startServices();
    page = res.page;
    loginPage = new LoginPage(page);
    taskListPage = new TaskListPage(page);
    decisionPage = new DecisionPage(page);
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

  it('logs in successfully and shows the task list', async() => {
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

  it('displays the deadline text and date', async() => {
    const deadlineStatus = await taskListPage.getElementText('#deadline-status');
    const deadlineDate = await taskListPage.getElementText('#deadline-date');
    /* eslint-disable-next-line no-magic-numbers */
    const expectedDeadlineDate = moment().utc().add(7, 'days').endOf('day').format('D MMMM YYYY');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.pending);
    expect(deadlineDate).to.equal(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when expired', async() => {
    await loginPage.visitPage();
    await loginPage.login('expired@example.com');
    await loginPage.screenshot('expired-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText('#deadline-status');
    const deadlineDate = await taskListPage.getElementText('#deadline-date');
    const expectedDeadlineDate = moment().utc().subtract(1, 'day').endOf('day').format('D MMMM YYYY');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.expired);
    expect(deadlineDate).to.equal(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when completed', async() => {
    await loginPage.visitPage();
    await loginPage.login('completed@example.com');
    await loginPage.screenshot('completed-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText('#deadline-status');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.completed);
  });

  it('displays the decision page with appeal upheld', async() => {
    await loginPage.visitPage();
    await loginPage.login('appeal.upheld@example.com');
    await loginPage.screenshot('decision-appeal-upheld-login');
    decisionPage.verifyPage();
    expect(await decisionPage.getHeading()).to.equal(i18n.decision.header);
    expect(await decisionPage.getElementText('#decision-outcome h2')).to.equal(i18n.decision.outcome['appeal-upheld']);
    expect(await decisionPage.getElementText('#decision-text')).to.equal('The final decision is this.');
  });

  it('displays the decision page with appeal denied', async() => {
    await loginPage.visitPage();
    await loginPage.login('appeal.denied@example.com');
    await loginPage.screenshot('decision-denied-upheld-login');
    decisionPage.verifyPage();
    expect(await decisionPage.getHeading()).to.equal(i18n.decision.header);
    expect(await decisionPage.getElementText('#decision-outcome h2')).to.equal(i18n.decision.outcome['appeal-denied']);
    expect(await decisionPage.getElementText('#decision-text')).to.equal('The final decision is this.');
  });

  it('does not allow access to task list when decision is issued', async() => {
    await taskListPage.visitPage();
    await loginPage.screenshot('decision-issued-task-list-navigate');
    decisionPage.verifyPage();
  });
});

export {};
