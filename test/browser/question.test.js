/* eslint-disable no-unused-expressions */
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/data/question').template;
const QuestionPage = require('test/page-objects/question');

const sampleHearingId = '121';
const sampleQuestionId = '62';

describe('Question page', () => {
  /* eslint-disable init-declarations */
  let page;
  let questionPage;
  let hearingId;
  let questionId;
  /* eslint-enable init-decalarations */

  before(async() => {
    const res = await startServices();
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionPage = new QuestionPage(page, hearingId, questionId);
    await questionPage.visitPage();
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
    await questionPage.screenshot('question');
    expect(await questionPage.getHeading()).to.equal(mockData.question_header_text);
  });

  it('displays question body from api request', async() => {
    await questionPage.screenshot('question');
    expect(await questionPage.getBody()).to.contain(mockData.question_body_text);
  });

  it('displays question body from api request', async() => {
    await questionPage.screenshot('question');
    expect(await questionPage.getElement('#question-field')).to.not.be.null;
  });
});
