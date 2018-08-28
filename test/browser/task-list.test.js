const moment = require('moment');
const { expect } = require('test/chai-sinon');
const { startServices } = require('test/browser/common');
const mockData = require('test/mock/services/allQuestions').template;
const TaskListPage = require('test/page-objects/task-list');
const paths = require('app/server/paths');
const i18n = require('app/locale/en.json');
const config = require('config');
const i18n = require('app/locale/en.json');

const testUrl = config.get('testUrl');

const sampleHearingId = '121';
const sampleQuestionId = '001';

describe('Task list page', () => {
  let page;
  let taskListpage;
  let hearingId;
  let questionId;
  let questionHeader;
  let deadlineExpiryDateFormatted;

  before(async() => {
    const res = await startServices({ bootstrapCoh: true });
    page = res.page;
    hearingId = res.cohTestData.hearingId || sampleHearingId;
    questionId = res.cohTestData.questionId || sampleQuestionId;
    questionHeader = res.cohTestData.questionHeader || mockData.questions({ sampleHearingId })[0].question_header_text;
    const deadlineExpiryDate = res.cohTestData.deadlineExpiryDate || mockData.deadline_expiry_date({ sampleHearingId });
    deadlineExpiryDateFormatted = moment.utc(deadlineExpiryDate).format('D MMMM YYYY');
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

  it('displays the deadline details', async() => {
    expect(await taskListpage.getElementText('#deadline-status')).to.equal(i18n.taskList.deadline.pending);
    expect(await taskListpage.getElementText('#deadline-date')).to.equal(deadlineExpiryDateFormatted);
  });

  it('displays the list of questions', async() => {
    expect(await taskListpage.getElementText(`#question-${questionId}`))
      .to.contain(questionHeader);
  });

  it('displays guidance for submitting evidence', async() => {
    const summaryText = await taskListpage.getElementText('#sending-evidence-guide summary span');
    expect(summaryText).to.contain(i18n.taskList.sendingEvidence.summary);
  });

  it('redirects to the question page for that question', async() => {
    await taskListpage.clickQuestion(questionId);
    expect(taskListpage.getCurrentUrl())
      .to.equal(`${testUrl}${paths.question}/${hearingId}/${questionId}`);
  });
});
