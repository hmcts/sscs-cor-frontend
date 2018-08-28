/* eslint-disable no-unused-expressions */
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const SubmitQuestionPage = require('test/page-objects/submit_question');
const paths = require('paths');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '121';
const sampleQuestionId = '62';

describe('Submit question page', () => {
  let page;
  let submitQuestionPage;
  let hearingId;
  let questionId;

  before(async() => {
    const res = await startServices({ bootstrapCoh: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    submitQuestionPage = new SubmitQuestionPage(page, hearingId, questionId);
    await submitQuestionPage.visitPage();
    await submitQuestionPage.screenshot('submit_question');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /submit_answer path', () => {
    submitQuestionPage.verifyPage();
  });

  it('displays submit answer button', async() => {
    expect(await submitQuestionPage.getElement('#submit-answer')).to.not.be.null;
  });

  it('redirects to /task-list page when a valid answer is submitted', async() => {
    await submitQuestionPage.submit();
    expect(submitQuestionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}/${hearingId}`);
  });
});
