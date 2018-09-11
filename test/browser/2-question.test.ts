import { CONST } from 'app/constants';
const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
const mockDataQuestion = require('test/mock/services/question').template;
const mockDataHearing = require('test/mock/services/hearing').template;
import { TaskListPage } from 'test/page-objects/task-list';
import { QuestionPage } from 'test/page-objects/question';
import { SubmitQuestionPage } from 'test/page-objects/submit_question';
import { QuestionsCompletedPage } from 'test/page-objects/questions-completed';
const i18n = require('app/server/locale/en');
const paths = require('app/server/paths');
const config = require('config');
import moment from 'moment';

const testUrl = config.get('testUrl');

const sampleHearingId = '1-pending';
const sampleQuestionIdList = ['001', '002', '003']

describe('Question page', () => {
  let page;
  let taskListPage;
  let questionPage;
  let submitQuestionPage;
  let questionsCompletedPage
  let hearingId;
  let questionIdList;
  let firstQuestionId;
  let questionHeader;
  let questionBody;
  let caseReference;

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true });
    console.log('have bootstraped and started and logged in');
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionIdList = res.cohTestData.questionIdList || sampleQuestionIdList;
    firstQuestionId = questionIdList.shift();
    questionHeader = res.cohTestData.questionHeader || mockDataQuestion.question_header_text({ questionId: firstQuestionId });
    questionBody = res.cohTestData.questionBody || mockDataQuestion.question_body_text({ questionId: firstQuestionId });
    caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    taskListPage = new TaskListPage(page);
    questionPage = new QuestionPage(page, hearingId, firstQuestionId);
    submitQuestionPage = new SubmitQuestionPage(page, hearingId, firstQuestionId);
    questionsCompletedPage = new QuestionsCompletedPage(page);
    await taskListPage.clickQuestion(firstQuestionId);
    console.log('would take screenshot now');
    // await questionPage.screenshot('question');
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
    expect(await questionPage.getHeading()).to.equal(questionHeader);
  });

  it('displays question body from api request', async() => {
    expect(await questionPage.getBody()).to.contain(questionBody);
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
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}`);
    });

    it('displays question status as draft', async() => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase())
    });
  });

  describe('submitting an answer', () => {
    before(async() => {
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously drafted answer', async() => {
      const savedAnswer = await questionPage.getElementValue('#question-field');
      expect(savedAnswer).to.equal('A valid answer')
    });

    it('is on the /submit_answer path after submitting answer', async() => {
      await questionPage.submitAnswer('Another valid answer');
      submitQuestionPage.verifyPage();
    });

    it('redirects to /task-list page when a valid answer is submitted', async() => {
      await submitQuestionPage.submit();
      expect(submitQuestionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}`);
    });

    it('displays question status as completed', async() => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase())
    });
  });

  describe('view a submitted answer', () => {
    before(async() => {
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously submitted answer', async() => {
      const savedAnswer = await questionPage.getElementText('#completed-answer .answer-value');
      expect(savedAnswer).to.equal('Another valid answer');
    });

    it('displays the previously submitted answer date', async() => {
      const savedAnswerDate = await questionPage.getElementText('#completed-answer .answer-datetime');
      expect(savedAnswerDate).to.equal(`Submitted: ${moment().utc().format(CONST.DATE_FORMAT)}`);
    });

    it('returns to task list if back is clicked', async() => {
      await questionPage.clickElement('.govuk-back-link');
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}`);
    });
  });  

  describe('submitting all answers', () => {
    async function answerQuestion(questionId) {
      await taskListPage.clickQuestion(questionId);
      await questionPage.submitAnswer('A valid answer');
      await submitQuestionPage.submit();
    }

    before('answer all but one remaining question', async() => {
      await page.goto(`${testUrl}${paths.taskList}`);
      while(questionIdList.length > 1) {
        const questionId = questionIdList.shift();
        await answerQuestion(questionId);
        const answerState = await taskListPage.getElementText(`#question-${questionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase())
      }
    });

    it('is on the questions completed page after submitting the final question', async() => {
      const questionId = questionIdList.shift();
      await answerQuestion(questionId);
      questionsCompletedPage.verifyPage();
    });

    it('shows the correct date for next contact', async() => {
      const expectedDate = moment().utc().add(7, 'days').format('D MMMM YYYY');
      const contactDate = await questionsCompletedPage.getElementText('#next-contact-date');
      expect(contactDate).to.equal(expectedDate);
    });
  });
});

export {};