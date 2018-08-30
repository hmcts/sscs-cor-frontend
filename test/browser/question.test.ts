const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/question').template;
const QuestionPage = require('test/page-objects/question');
const i18n = require('app/locale/en');
const paths = require('app/server/paths');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '121';
const sampleQuestionId = '62';

describe('Question page', () => {
  let page;
  let questionPage;
  let hearingId;
  let questionId;

  before(async() => {
    const res = await startServices({ bootstrapCoh: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionPage = new QuestionPage(page, hearingId, questionId);
    await questionPage.visitPage();
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
    expect(await questionPage.getHeading()).to.equal(mockData.question_header_text);
  });

  it('displays question body from api request', async() => {
    expect(await questionPage.getBody()).to.contain(mockData.question_body_text);
  });

  it('displays question answer box', async() => (
    expect(await questionPage.getElement('#question-field')).to.not.be.null
  ));

  it('displays guidance for submitting evidence', async() => {
    const summaryText = await questionPage.getElementText('#sending-evidence-guide summary span');
    expect(summaryText).to.contain(i18n.question.sendingEvidence.summary);
  });

  it('displays an error message in the summary when you try to save an empty answer', async() => {
    await questionPage.saveAnswer('');
    expect(await questionPage.getElementText('.govuk-error-summary'))
      .contain(i18n.question.textareaField.error.empty);
  });

  it('displays an error message above the field when you try to save an empty answer', async() => {
    await questionPage.saveAnswer('');
    expect(await questionPage.getElementText('#question-field-error'))
      .contain(i18n.question.textareaField.error.empty);
  });

  it.skip('redirects to /task-list page when a valid answer is saved', async() => {
    await questionPage.saveAnswer('A valid answer');
    expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}/${hearingId}`);
  });
});

export {};