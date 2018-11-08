import * as moment from 'moment';
import * as _ from 'lodash';
import { CONST } from 'app/constants';
const { expect } = require('test/chai-sinon');
import { Page } from 'puppeteer';
import { startServices } from 'test/browser/common';
const mockDataQuestion = require('test/mock/cor-backend/services/question').template;
const mockDataHearing = require('test/mock/cor-backend/services/hearing').template;
import { TaskListPage } from 'test/page-objects/task-list';
import { QuestionPage } from 'test/page-objects/question';
import { SubmitQuestionPage } from 'test/page-objects/submit-question';
import { QuestionsCompletedPage } from 'test/page-objects/questions-completed';
import { UploadEvidencePage } from 'test/page-objects/upload-evidence';
const i18n = require('locale/en');
import * as Paths from 'app/server/paths';
const config = require('config');

const testUrl = config.get('testUrl');

const sampleQuestionIdList = ['001', '002', '003'];
const sampleQuestionOrdinal = '1';

const pa11y = require('pa11y');
let pa11yOpts = _.clone(config.get('pa11y'));
const pa11yScreenshotPath = config.get('pa11yScreenshotPath');

describe('Question page', () => {
  let page: Page;
  let taskListPage: TaskListPage;
  let questionPage: QuestionPage;
  let submitQuestionPage: SubmitQuestionPage;
  let questionsCompletedPage: QuestionsCompletedPage;
  let uploadEvidencePage: UploadEvidencePage;
  let questionIdList: string[];
  let questionOrdinal: string;
  let firstQuestionId: string;
  let questionHeader: string;
  let questionBody: string;
  let caseReference: string;

  before('start services and bootstrap data in CCD/COH', async () => {
    const res = await startServices({ performLogin: true });
    page = res.page;
    questionIdList = res.cohTestData.questionIdList || sampleQuestionIdList;
    firstQuestionId = questionIdList.shift();
    questionOrdinal = res.cohTestData.questionOrdinal || sampleQuestionOrdinal;
    questionHeader = res.cohTestData.questionHeader || mockDataQuestion.question_header_text({ questionId: firstQuestionId });
    questionBody = res.cohTestData.questionBody || mockDataQuestion.question_body_text({ questionId: firstQuestionId });
    caseReference = res.ccdCase.caseReference || mockDataHearing.case_reference;
    taskListPage = new TaskListPage(page);
    questionPage = new QuestionPage(page, questionOrdinal);
    submitQuestionPage = new SubmitQuestionPage(page, questionOrdinal);
    uploadEvidencePage = new UploadEvidencePage(page, questionOrdinal);
    questionsCompletedPage = new QuestionsCompletedPage(page);
    await taskListPage.clickQuestion(firstQuestionId);
    await questionPage.screenshot('question');
    pa11yOpts.browser = res.browser;
    pa11yOpts.page = questionPage.page;
  });

  after(async () => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /question path', () => {
    questionPage.verifyPage();
  });

  /* PA11Y */
  it('checks /question passes @pa11y', async () => {
    pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question.png`;
    const result = await pa11y(pa11yOpts);
    expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
  });

  it('displays question heading from api request', async () => {
    expect(await questionPage.getHeading()).to.equal(questionHeader);
  });

  it('displays question body from api request', async () => {
    expect(await questionPage.getBody()).to.contain(questionBody);
  });

  it('displays question answer box', async () => (
    expect(await questionPage.getElement('#question-field')).to.not.be.null
  ));

  it('allows saving an empty answer and returns to the task list', async() => {
    await questionPage.saveAnswer('');
    taskListPage.verifyPage();
  });

  it('displays an error message in the summary when you try to submit an empty answer', async () => {
    await questionPage.visitPage();
    await questionPage.submitAnswer('');
    expect(await questionPage.getElementText('.govuk-error-summary'))
      .contain(i18n.question.textareaField.error.empty);
    expect(await questionPage.getElementText('#question-field-error'))
      .equal(i18n.question.textareaField.error.empty);
  });

  describe('evidence upload per question disabled', () => {
    it('displays guidance for submitting evidence with case reference', async () => {
      const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
      const displayedCaseRef = await taskListPage.getElementText('#evidence-case-reference');
      expect(summaryText.trim()).to.equal(i18n.question.sendingEvidence.summary);
      expect(displayedCaseRef).to.equal(caseReference);
    });
  });

  describe('with evidence upload per question enabled', () => {
    before(async () => {
      await questionPage.setCookie('evidenceUploadOverride', 'true');
      await questionPage.visitPage();
    });

    after(async () => {
      await questionPage.deleteCookie('evidenceUploadOverride');
      await questionPage.visitPage();
    });

    describe('with javascript OFF', () => {
      before(async () => {
        await page.setJavaScriptEnabled(false);
        await questionPage.visitPage();
      });
      after(async () => {
        await page.setJavaScriptEnabled(true);
      });

      it('display evidence upload section', async () => {
        const headerText = await questionPage.getElementText('#evidence-upload h2');
        const addFile = await questionPage.getElementValue('#add-file');
        expect(headerText).to.equal(i18n.question.evidenceUpload.header);
        expect(addFile).to.equal(i18n.question.evidenceUpload.addFileButton);
      });

      it('displays empty list of uploaded files', async () => {
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(firstListItem.trim()).to.equal('No files uploaded');
      });

      it('also displays guidance posting evidence with reference', async () => {
        const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
        const displayedCaseRef = await questionPage.getElementText('#evidence-case-reference');
        expect(summaryText).to.contain(i18n.question.evidenceUpload.postEvidence.summary);
        expect(displayedCaseRef).to.equal(caseReference);
      });

      /* PA11Y */
      it('checks /question with evidence upload per question enabled @pa11y', async () => {
        await page.setJavaScriptEnabled(true);
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-evidence-enabled.png`;
        pa11yOpts.page = questionPage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
        await page.setJavaScriptEnabled(false);
      });

      it('shows the upload evidence page', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.clickElement('#add-file')
        ]);
        await questionPage.screenshot('question-upload-evidence');
        uploadEvidencePage.verifyPage();
        expect(await uploadEvidencePage.getHeading()).to.equal(i18n.questionUploadEvidence.header);
      });

      /* PA11Y */
      it('checks /upload-evidence passes @pa11y', async () => {
        await page.setJavaScriptEnabled(true);
        await uploadEvidencePage.visitPage();
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-upload-evidence.png`;
        pa11yOpts.page = uploadEvidencePage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
        await page.setJavaScriptEnabled(false);
      });

      it('validates that a file has been chosen', async () => {
        await uploadEvidencePage.submit();
        expect(await uploadEvidencePage.getElementText('.govuk-error-summary')).contain(i18n.questionUploadEvidence.error.empty);
        expect(await questionPage.getElementText('#file-upload-1-error')).equal(i18n.questionUploadEvidence.error.empty);
      });

      it('takes the user back to the question after submitting evidence', async () => {
        await uploadEvidencePage.selectFile('evidence.txt');
        await uploadEvidencePage.submit();
        questionPage.verifyPage();
      });

      it('displays upload files', async () => {
        const count: number = await questionPage.countEvidence();
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(1);
        expect(firstListItem.trim()).to.equal('evidence.txt');
      });

      it('shows question as draft status', async () => {
        await questionPage.saveAnswer('');
        const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
      });

      it('tries to upload evidence file that is not an allowed type', async () => {
        await questionPage.visitPage();
        await Promise.all([
          page.waitForNavigation(),
          questionPage.clickElement('#add-file')
        ]);
        await uploadEvidencePage.selectFile('disallowed_evidence.disallowed');
        await uploadEvidencePage.submit();

        expect(await uploadEvidencePage.getElementText('#file-upload-1-error'))
          .contain(i18n.questionUploadEvidence.error.invalidFileType);
      });

      it('uploads a second evidence file and shows in upload list', async () => {
        await uploadEvidencePage.visitPage();
        await uploadEvidencePage.selectFile('evidence.pdf');
        await uploadEvidencePage.submit();

        const count: number = await questionPage.countEvidence();
        const secondListItem: string = await questionPage.getEvidenceListText(1);
        expect(count).to.equal(2);
        expect(secondListItem.trim()).to.equal('evidence.pdf');
      });

      it('deletes uploaded evidence', async () => {
        let count: number = await questionPage.countEvidence();
        expect(count).to.equal(2);
        for (let i = 1; i <= count; i++) {
          await questionPage.deleteEvidence();
        }
        const finalCount: number = await questionPage.countEvidence();
        expect(finalCount).to.equal(0);
      });
    });

    describe('with javascript ON', () => {
      before(async () => {
        await questionPage.visitPage();
      });

      it('displays evidence upload section toggle', async () => {
        const checkboxLabel = await questionPage.getElementText('[for=provide-evidence-1]');
        expect(checkboxLabel).to.equal(i18n.question.evidenceUpload.checkbox);
      });

      it('checking the box reveals the upload section', async () => {
        await page.waitForSelector('#evidence-upload-reveal-container', { hidden: true, timeout: 1000 });
        await questionPage.clickElement('#provide-evidence-1');
        await page.waitForSelector('#evidence-upload-reveal-container', { visible: true, timeout: 1000 });
      });

      /* PA11Y */
      it('checks /question with evidence upload per question enabled @pa11y', async () => {
        await questionPage.clickElement('#provide-evidence-1');
        pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-evidence-enabled-js.png`;
        pa11yOpts.page = questionPage.page;
        const result = await pa11y(pa11yOpts);
        expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
      });

      it('submits the page when a file is selected', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('evidence.txt')
        ]);
        questionPage.verifyPage();
      });

      it('displays upload files', async () => {
        const count: number = await questionPage.countEvidence();
        const firstListItem: string = await questionPage.getEvidenceListText(0);
        expect(count).to.equal(1);
        expect(firstListItem.trim()).to.equal('evidence.txt');
      });

      it('shows question as draft status', async () => {
        await questionPage.saveAnswer('');
        const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
      });

      it('tries to upload evidence file that is not an allowed type', async () => {
        await questionPage.visitPage();
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('disallowed_evidence.disallowed')
        ]);

        expect(await uploadEvidencePage.getElementText('#file-upload-1-error'))
          .contain(i18n.questionUploadEvidence.error.invalidFileType);
      });

      it('uploads a second piece of evidence and show in uploaded list', async () => {
        await Promise.all([
          page.waitForNavigation(),
          questionPage.selectFile('evidence.pdf')
        ]);
        questionPage.verifyPage();
        const count: number = await questionPage.countEvidence();
        const secondListItem: string = await questionPage.getEvidenceListText(1);
        expect(count).to.equal(2);
        expect(secondListItem.trim()).to.equal('evidence.pdf');
      });

      it('deletes uploaded evidence', async () => {
        let count: number = await questionPage.countEvidence();
        expect(count).to.equal(2);
        for (let i = 1; i <= count; i++) {
          await questionPage.deleteEvidence();
        }
        const finalCount: number = await questionPage.countEvidence();
        expect(finalCount).to.equal(0);
      });
    });
  });

  describe('saving an answer', () => {
    before('save a answer', async () => {
      await questionPage.saveAnswer('A valid answer');
    });

    it('redirects to /task-list page when a valid answer is saved', async () => {
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });

    it('displays question status as draft', async () => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.draft.toUpperCase());
    });

    /* PA11Y */
    it('checks question status passes @pa11y', async () => {
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-list-draft.png`;
      pa11yOpts.page = taskListPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });
  });

  describe('submitting an answer', () => {
    before('selects the question', async () => {
      await taskListPage.visitPage();
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously drafted answer', async () => {
      const savedAnswer = await questionPage.getElementValue('#question-field');
      expect(savedAnswer).to.equal('A valid answer');
    });

    /* PA11Y */
    it('checks draft answer passes @pa11y', async () => {
      pa11yOpts.screenCapture = `${pa11yScreenshotPath}/question-draft-answer.png`;
      pa11yOpts.page = questionPage.page;
      const result = await pa11y(pa11yOpts);
      expect(result.issues.length).to.equal(0, JSON.stringify(result.issues, null, 2));
    });

    it('is on the /submit_answer path after submitting answer', async () => {
      await questionPage.submitAnswer('Another valid answer');
      submitQuestionPage.verifyPage();
    });

    it('redirects to /task-list page when a valid answer is submitted', async () => {
      await submitQuestionPage.submit();
      expect(submitQuestionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });

    it('displays question status as completed', async () => {
      const answerState = await taskListPage.getElementText(`#question-${firstQuestionId} .answer-state`);
      expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase());
    });
  });

  describe('view a submitted answer', () => {
    before(async () => {
      await taskListPage.clickQuestion(firstQuestionId);
    });

    it('displays the previously submitted answer', async () => {
      const savedAnswer = await questionPage.getElementText('#completed-answer .answer-value');
      expect(savedAnswer).to.equal('Another valid answer');
    });

    it('displays the previously submitted answer date', async () => {
      const savedAnswerDate = await questionPage.getElementText('#completed-answer .answer-date');
      expect(savedAnswerDate).to.equal(`Submitted: ${moment.utc().format(CONST.DATE_FORMAT)}`);
    });

    it('returns to task list if back is clicked', async () => {
      await Promise.all([
        page.waitForNavigation(),
        questionPage.clickElement('.govuk-back-link')
      ]);
      expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${Paths.taskList}`);
    });
  });

  describe('submitting all answers', () => {
    async function answerQuestion(questionId) {
      await taskListPage.clickQuestion(questionId);
      await questionPage.submitAnswer('A valid answer');
      await submitQuestionPage.submit();
    }

    before('answer all but one remaining question', async () => {
      await page.goto(`${testUrl}${Paths.taskList}`);
      while (questionIdList.length > 1) {
        const questionId = questionIdList.shift();
        await answerQuestion(questionId);
        const answerState = await taskListPage.getElementText(`#question-${questionId} .answer-state`);
        expect(answerState).to.equal(i18n.taskList.answerState.completed.toUpperCase());
      }
    });

    it('is on the questions completed page after submitting the final question', async () => {
      const questionId = questionIdList.shift();
      await answerQuestion(questionId);
      questionsCompletedPage.verifyPage();
    });

    it('shows the correct date for next contact', async () => {
      const expectedDate = moment.utc().add(7, 'days').format('D MMMM YYYY');
      const contactDate = await questionsCompletedPage.getElementText('#next-contact-date');
      expect(contactDate).to.equal(expectedDate);
    });
  });
});

export { };
