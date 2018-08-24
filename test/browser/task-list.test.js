const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/allQuestions').template;
const TaskListPage = require('test/page-objects/task-list');
const paths = require('paths');
const config = require('config');

const testUrl = config.get('testUrl');

const sampleHearingId = '121';
const sampleQuestionId = '001';

describe('Task list page', () => {
  let page;
  let taskListpage;
  let hearingId;
  let questionId;
  let questionHeader;

  before(async() => {
    const res = await startServices({ bootstrapCoh: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionHeader = res.cohTestData.questionHeader || mockData.questions[0].question_header_text;
    taskListpage = new TaskListPage(page, hearingId);
    await taskListpage.visitPage();
    await taskListpage.screenshot('task-list');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /task-list path', () => {
    taskListpage.verifyPage();
  });

  it('displays the list of questions', async() => {
    expect(await taskListpage.getElementText(`#question-${questionId}`))
      .to.contain(questionHeader);
  });

  it('redirects to the question page for that question', async() => {
    await taskListpage.clickQuestion(questionId);
    expect(taskListpage.getCurrentUrl())
      .to.equal(`${testUrl}${paths.question}/${hearingId}/${questionId}`);
  });
});
