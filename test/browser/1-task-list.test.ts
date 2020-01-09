import * as moment from 'moment';
import * as _ from 'lodash';
const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
const mockDataQuestions = require('test/mock/cor-backend/services/all-questions').template;
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
import { TaskListPage } from 'test/page-objects/task-list';
import { LoginPage } from 'test/page-objects/login';
import * as Paths from 'app/server/paths';
const i18n = require('locale/en.json');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '1-pending';
const sampleQuestionId = '001';
const sampleQuestionOrdinal = '1';

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');

describe('Task list page', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let loginPage: LoginPage;
  let hearingId;
  let questionId;
  let questionOrdinal;
  let questionHeader;
  let caseReference;
  let deadlineExpiryDateFormatted;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ bootstrapData: true, performLogin: true });
    page = res.page;
    pa11yOpts.browser = res.browser;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionOrdinal = res.cohTestData.questionOrdinal || sampleQuestionOrdinal;
    questionHeader = res.cohTestData.questionHeader || mockDataQuestions.questions({ sampleHearingId })[0].question_header_text;
    caseReference = res.ccdCase.case_reference || mockDataHearing.case_reference;
    const deadlineExpiryDate = res.cohTestData.deadlineExpiryDate || mockDataQuestions.deadline_expiry_date({ sampleHearingId });
    deadlineExpiryDateFormatted = moment.utc(deadlineExpiryDate).format('D MMMM YYYY');
    taskListPage = new TaskListPage(page);
    loginPage = new LoginPage(page);
    await taskListPage.screenshot('task-list');
  });

  afterEach(function () {
    if (this.currentTest.state !== 'passed') {
      const testName = this.currentTest.title.replace(/[ \/]/g, '_');
      taskListPage.screenshot('failed-' + testName).catch(err => {
        console.log(err);
      });
    }
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /task-list path', async () => {
    taskListPage.verifyPage();
  });

  /* PA11Y */
  it('checks /task-list passes @pa11y', async () => {
    pa11yOpts.page = taskListPage.page;
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/task-list.png`;
    const result = await pa11y(`${testUrl}${taskListPage.pagePath}`, pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('displays the appellant case reference', async () => {
    const displayedCaseRef = await taskListPage.getElementText('#case-reference');
    expect(displayedCaseRef).to.equal(caseReference);
  });

  it('displays Providing additional evidence link', async () => {
    const evidenceUploadLink = await taskListPage.getElementText('#evidence-options-link');
    expect(evidenceUploadLink).to.equal('i18n.taskList.sendingEvidence.anchorText');
  });

  it('displays the deadline details as pending', async () => {
    expect(await taskListPage.getElementText('#deadline-status')).to.contain(i18n.taskList.deadline.pending);
    expect(await taskListPage.getElementText('#deadline-status')).to.contain(deadlineExpiryDateFormatted);
  });

  it('displays the list of questions', async () => {
    const displayedQuestionHeader = await taskListPage.getElementText(`#question-${questionId} .question-header-text`);
    expect(displayedQuestionHeader).to.equal(questionHeader);
  });

  it('displays question status as unanswered', async () => {
    const answerElement = await taskListPage.getElement(`#question-${questionId} .answer-state`);
    expect(answerElement).to.be.null;
  });

  it('redirects to the question page for that question', async () => {
    await taskListPage.clickQuestion(questionId);
    expect(taskListPage.getCurrentUrl())
      .to.equal(`${testUrl}${Paths.question}/${questionOrdinal}`);
  });

  it('signs out and prevents access to pages', async () => {
    await taskListPage.signOut();
    loginPage.verifyPage();
    await taskListPage.visitPage();
    loginPage.verifyPage();
  });
});

export { };
