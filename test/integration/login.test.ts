const moment = require('moment');
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/cor-backend/services/hearing').template;
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
import { DecisionPage } from 'test/page-objects/decision';
import { TribunalViewPage } from 'test/page-objects/tribunal-view';
const i18n = require('locale/en');

describe('Login page', () => {
  let page;
  let loginPage;
  let taskListPage;
  let decisionPage;
  let tribunalViewPage;

  before(async() => {
    const res = await startServices();
    page = res.page;
    loginPage = new LoginPage(page);
    taskListPage = new TaskListPage(page);
    decisionPage = new DecisionPage(page);
    tribunalViewPage = new TribunalViewPage(page);
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('handles online hearing not found', async() => {
    await loginPage.visitPage();
    await loginPage.login('not.found@example.com', 'examplePassword');
    const errorSummary = await loginPage.getElementText('.govuk-heading-l');
    expect(errorSummary).contain(i18n.emailNotFound.header);
  });

  it('handles multiple online hearings found', async() => {
    await loginPage.visitPage();
    await loginPage.login('multiple@example.com', 'examplePassword');
    const errorSummary = await loginPage.getElementText('.govuk-heading-l');
    expect(errorSummary).contain(i18n.emailNotFound.header);
  });

  it('logs in successfully and shows the task list', async() => {
    await loginPage.visitPage();
    await loginPage.login('test@example.com', 'examplePassword');
    await loginPage.screenshot('successful-login');
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
    const expectedDeadlineDate = moment.utc().add(7, 'days').endOf('day').format('D MMMM YYYY');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.pending);
    expect(deadlineDate).to.equal(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when expired', async() => {
    await loginPage.visitPage();
    await loginPage.login('expired@example.com', 'examplePassword');
    await loginPage.screenshot('expired-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText('#deadline-status');
    const deadlineDate = await taskListPage.getElementText('#deadline-date');
    const expectedDeadlineDate = moment.utc().subtract(1, 'day').endOf('day').format('D MMMM YYYY');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.expired);
    expect(deadlineDate).to.equal(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when completed', async() => {
    await loginPage.visitPage();
    await loginPage.login('completed@example.com', 'examplePassword');
    await loginPage.screenshot('completed-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText('#deadline-status');
    expect(deadlineStatus).to.equal(i18n.taskList.deadline.completed);
  });

  it('displays the tribunal view page', async() => {
    await loginPage.visitPage();
    await loginPage.login('view.issued@example.com', 'examplePassword');
    await loginPage.screenshot('tribunal-view-issued-login');
    tribunalViewPage.verifyPage();
    expect(await tribunalViewPage.getHeading()).to.equal(i18n.tribunalView.header);
    expect(await tribunalViewPage.getElementText('#decision-text')).to.equal('The final decision is this.');
  });

  it('displays the decision page with appeal upheld', async() => {
    await loginPage.visitPage();
    await loginPage.login('appeal.upheld@example.com', 'examplePassword');
    await loginPage.screenshot('decision-appeal-upheld-login');
    decisionPage.verifyPage();
    expect(await decisionPage.getHeading()).to.equal(i18n.tribunalDecision.header);
    expect(await decisionPage.getElementText('#decision-outcome h2')).to.equal(i18n.tribunalDecision.outcome.decision_accepted);
    expect(await decisionPage.getElementText('#decision-text')).to.equal('The final decision is this.');
  });

  it('displays the decision page with appeal denied', async() => {
    await loginPage.visitPage();
    await loginPage.login('appeal.denied@example.com', 'examplePassword');
    await loginPage.screenshot('decision-denied-upheld-login');
    decisionPage.verifyPage();
    expect(await decisionPage.getHeading()).to.equal(i18n.tribunalDecision.header);
    expect(await decisionPage.getElementText('#decision-outcome h2')).to.equal(i18n.tribunalDecision.outcome.decision_rejected);
    expect(await decisionPage.getElementText('#decision-text')).to.equal('The final decision is this.');
  });

  it('does not allow access to task list when decision is issued', async() => {
    await taskListPage.visitPage();
    await loginPage.screenshot('decision-issued-task-list-navigate');
    decisionPage.verifyPage();
  });
});

export {};
