import { StatusPage } from '../page-objects/status';

import { AssignCasePage } from '../page-objects/assign-case';
import { LoginPage } from 'test/page-objects/login';
import { TaskListPage } from 'test/page-objects/task-list';
import { DecisionPage } from 'test/page-objects/decision';
import { expect } from 'test/chai-sinon';
import moment from 'moment';
import { startServices } from 'test/browser/common';
import content from 'app/common/locale/content.json';

describe.skip('Login page', function () {
  let page;
  let loginPage;
  let statusPage;
  let taskListPage;
  let decisionPage;
  let assignCasePage;

  before(async function () {
    const res = await startServices();
    page = res.page;
    loginPage = new LoginPage(page);
    statusPage = new StatusPage(page);
    taskListPage = new TaskListPage(page);
    decisionPage = new DecisionPage(page);
    assignCasePage = new AssignCasePage(page);
  });

  after(async function () {
    if (page?.close) {
      await page.close();
    }
  });

  it('handles online hearing not found', async function () {
    await loginPage.visitPage();
    await loginPage.login('not.found@example.com', 'examplePassword');
    const errorSummary = await loginPage.getElementText('.govuk-heading-l');
    expect(errorSummary).contain(content.en.login.failed.emailNotFound.header);
  });

  it('handles multiple online hearings found', async function () {
    await loginPage.visitPage();
    await loginPage.login('multiple@example.com', 'examplePassword');
    const errorSummary = await loginPage.getElementText('.govuk-heading-l');
    expect(errorSummary).contain(content.en.login.failed.technicalError.header);
  });

  it('handles non cor hearing found', async function () {
    await loginPage.visitPage();
    await loginPage.login('not.cor@example.com', 'examplePassword');
    const errorSummary = await loginPage.getElementText('.govuk-heading-l');
    expect(errorSummary).contain(
      content.en.login.failed.cannotUseService.header
    );
  });

  it('logs in successfully and shows the task list', async function () {
    await loginPage.visitPage();
    await loginPage.login('test@example.com', 'examplePassword');
    await loginPage.screenshot('successful-login');
    expect(await taskListPage.getHeading()).to.equal(
      content.en.taskList.header
    );
  });

  it('displays the appellant name and case reference', async function () {
    const appellantName = await taskListPage.getElementText('#appellant-name');
    const caseReference = await taskListPage.getElementText('#case-reference');
    expect(appellantName).to.equal('Adam Jenkins');
    expect(caseReference).to.equal('112233');
  });

  it('displays the deadline text and date', async function () {
    const deadlineStatus = await taskListPage.getElementText(
      '#deadline-status'
    );
    /* eslint-disable-next-line no-magic-numbers */
    const expectedDeadlineDate = moment
      .utc()
      .add(7, 'days')
      .endOf('day')
      .format('D MMMM YYYY');
    expect(deadlineStatus).to.contain(content.en.taskList.deadline.pending);
    expect(deadlineStatus).to.contain(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when expired', async function () {
    await loginPage.visitPage();
    await loginPage.login('expired@example.com', 'examplePassword');
    await loginPage.screenshot('expired-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText(
      '#deadline-status'
    );

    const expectedDeadlineDate = moment
      .utc()
      .subtract(1, 'day')
      .endOf('day')
      .format('D MMMM YYYY');
    expect(deadlineStatus).to.contain(content.en.taskList.deadline.expired);
    expect(deadlineStatus).to.contain(expectedDeadlineDate);
  });

  it('displays the deadline appropriately when completed', async function () {
    await loginPage.visitPage();
    await loginPage.login('completed@example.com', 'examplePassword');
    await loginPage.screenshot('completed-login');
    taskListPage.verifyPage();
    const deadlineStatus = await taskListPage.getElementText(
      '#deadline-status'
    );
    expect(deadlineStatus).to.contain(content.en.taskList.deadline.completed);
  });

  it('displays the decision page with appeal upheld', async function () {
    await loginPage.visitPage();
    await loginPage.login('appeal.upheld@example.com', 'examplePassword');
    await loginPage.screenshot('decision-appeal-upheld-login');
    decisionPage.verifyPage();
    expect(await decisionPage.getHeading()).to.equal(
      content.en.tribunalDecision.header
    );
    expect(await decisionPage.getElementText('#decision-text')).to.equal(
      'final decision reason'
    );
  });

  it('does not allow access to task list when decision is issued', async function () {
    await taskListPage.visitPage();
    await loginPage.screenshot('decision-issued-task-list-navigate');
    decisionPage.verifyPage();
  });
});
