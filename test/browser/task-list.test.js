/* eslint-disable no-unused-expressions */
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/question').template;
const TaskListPage = require('test/page-objects/task-list');
const i18n = require('app/locale/en');
const paths = require('paths');
const config = require('config');

const testUrl = config.get('testUrl');
const testingLocalhost = testUrl.indexOf('localhost') !== -1;

const sampleHearingId = '121';
const sampleQuestionId = '001';

describe('Task list page', () => {
  /* eslint-disable init-declarations */
  let page;
  let taskListpage;
  let hearingId;
  let questionId;
  /* eslint-enable init-decalarations */

  before(async() => {
    const res = await startServices({ bootstrapCoh: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
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

  if (testingLocalhost) {
    it('redirects to the question page for that question', async() => {
      await taskListpage.clickQuestion(questionId);
      expect(taskListpage.getCurrentUrl())
        .to.equal(`${testUrl}${paths.question}/${hearingId}/${questionId}`);
    });
  }

  // it('displays question heading from api request', async() => {
  //   expect(await questionPage.getHeading()).to.equal(mockData.question_header_text);
  // });
  //
  // if (testingLocalhost) {
  //   it('redirects to /task-list page when a valid answer is saved', async() => {
  //     await questionPage.saveAnswer('A valid answer');
  //     expect(questionPage.getCurrentUrl()).to.equal(`${testUrl}${paths.taskList}/121`);
  //   });
  // }
});
