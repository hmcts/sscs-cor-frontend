const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockDataQuestion = require('test/mock/services/question').template;
const mockDataHearing = require('test/mock/services/hearing').template;
const TaskListPage = require('test/page-objects/task-list');
const QuestionPage = require('test/page-objects/question');
const SubmitQuestionPage = require('test/page-objects/submit_question');
const i18n = require('app/server/locale/en');
const paths = require('app/server/paths');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '1-pending';
const sampleQuestionId = '001';

describe('Question page', () => {
  let page;
  let taskListPage;
  let questionPage;
  let submitQuestionPage;
  let hearingId;
  let questionId;
  let caseReference;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    taskListPage = new TaskListPage(page)
    questionPage = new QuestionPage(page, hearingId, questionId);
    submitQuestionPage = new SubmitQuestionPage(page, hearingId, questionId);
    await taskListPage.clickQuestion(questionId);
    await questionPage.screenshot('question');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /question path', () => {
    questionPage.verifyPage();
  });

  it('displays question heading from api request', async() => {
    expect(await questionPage.getHeading()).to.equal(mockDataQuestion.question_header_text);
  });

  it('displays question body from api request', async() => {
    expect(await questionPage.getBody()).to.contain(mockDataQuestion.question_body_text);
  });

  it('displays question answer box', async() => (
    expect(await questionPage.getElement('#question-field')).to.not.be.null
  ));

  it('displays guidance for submitting evidence with case reference', async() => {
    const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
    const displayedCaseRef = await taskListPage.getElementText('#evidence-case-reference');
    expect(summaryText).to.equal(i18n.question.sendingEvidence.summary);
    expect(displayedCaseRef).to.equal(caseReference);
  });

  it('displays an error message in the summary when you try to save an empty answer', async() => {
    await questionPage.saveAnswer('');
    expect(await questionPage.getElementText('.govuk-error-summary'))
      .contain(i18n.question.textareaField.error.empty);
    expect(await questionPage.getElementText('#question-field-error'))
      .equal(i18n.question.textareaField.error.empty);
  });

  describe('saving an answer', () => {
    it('redirects to /task-list page when a valid answer is saved', async() => {
      await questionPage.saveAnswer('A valid answer');
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}/${hearingId}`);
    });

    // TODO: add state to mocks to be able to test this properly
    it('displays question status as draft', async() => {
      const answerState = await taskListPage.getElementText(`#question-${questionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase())
    });
  });

  describe('submitting an answer', () => {
    before(async() => {
      await taskListPage.clickQuestion(questionId);
    });

    // TODO: add state to mocks to be able to test this
    it('displays the previously drafted answer');

    it('is on the /submit_answer path after submitting answer', async() => {
      await questionPage.submitAnswer('A valid answer');
      submitQuestionPage.verifyPage();
    });

    it('redirects to /task-list page when a valid answer is submitted', async() => {
      await submitQuestionPage.submit();
      expect(submitQuestionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}/${hearingId}`);
    });

    // TODO: add state to mocks to be able to test this
    xit('displays question status as completed', async() => {
      const answerState = await taskListPage.getElementText(`#question-${questionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase())
    });
  })
});

export {};