const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/data/question').template;
const QuestionPage = require('test/page-objects/question');

describe('Question page', () => {
  /* eslint-disable init-declarations */
  let page;
  let questionPage;
  /* eslint-enable init-decalarations */

  before(async() => {
    const res = await startServices();
    page = res.page;
    questionPage = new QuestionPage(page);
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

  it('has question heading from api request', async() => {
    await questionPage.screenshot('question');
    expect(await questionPage.getHeading()).to.equal(mockData.question_header_text);
  });
});
