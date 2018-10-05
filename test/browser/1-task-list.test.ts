const moment = require('moment');
const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
const mockDataQuestions = require('test/mock/cor-backend/services/all-questions').template;
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
import { TaskListPage } from 'test/page-objects/task-list';
import * as Paths from 'app/server/paths';
const i18n = require('locale/en.json');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '1-pending';
const sampleQuestionId = '001';
const sampleQuestionOrdinal = '1';

describe('Task list page', () => {
  let page: Page;
  let taskListPage;
  let hearingId;
  let questionId;
  let questionOrdinal;
  let questionHeader;
  let caseReference;
  let deadlineExpiryDateFormatted;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionOrdinal = res.cohTestData.questionOrdinal || sampleQuestionOrdinal;
    questionHeader = res.cohTestData.questionHeader || mockDataQuestions.questions({ sampleHearingId })[0].question_header_text;
    caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    const deadlineExpiryDate = res.cohTestData.deadlineExpiryDate || mockDataQuestions.deadline_expiry_date({ sampleHearingId });
    deadlineExpiryDateFormatted = moment.utc(deadlineExpiryDate).format('D MMMM YYYY');
    taskListPage = new TaskListPage(page);
    await taskListPage.screenshot('task-list');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /task-list path', () => {
    taskListPage.verifyPage();
  });

  it('displays the appellant case reference', async() => {
    const displayedCaseRef = await taskListPage.getElementText('#case-reference');
    expect(displayedCaseRef).to.equal(caseReference);
  });

  it('displays guidance for submitting evidence with case reference', async() => {
    const summaryText = await taskListPage.getElementText('#sending-evidence-guide summary span');
    const displayedCaseRef = await taskListPage.getElementText('#evidence-case-reference');
    expect(summaryText).to.equal(i18n.taskList.sendingEvidence.summary);
    expect(displayedCaseRef).to.equal(caseReference);
  });

  it('displays the deadline details as pending', async() => {
    expect(await taskListPage.getElementText('#deadline-status')).to.equal(i18n.taskList.deadline.pending);
    expect(await taskListPage.getElementText('#deadline-date')).to.equal(deadlineExpiryDateFormatted);
  });

  it('displays the list of questions', async() => {
    const displayedQuestionHeader = await taskListPage.getElementText(`#question-${questionId} .question-header-text`);
    expect(displayedQuestionHeader).to.equal(questionHeader);
  });

  it('displays question status as unanswered', async() => {
    const answerElement = await taskListPage.getElement(`#question-${questionId} .answer-state`);
    expect(answerElement).to.be.null;
  });

  it('redirects to the question page for that question', async() => {
    await taskListPage.clickQuestion(questionId);
    expect(taskListPage.getCurrentUrl())
      .to.equal(`${testUrl}${Paths.question}/${questionOrdinal}`);
  });
});

export {};
