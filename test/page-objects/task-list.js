const { taskList } = require('app/server/paths');
const BasePage = require('test/page-objects/base');

class TaskListPage extends BasePage {
  constructor(page, hearingId) {
    super(page);
    let path = taskList;
    if (hearingId) {
      path += `/${hearingId}`;
    }
    this.pagePath = path;
  }

  async clickQuestion(questionId) {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement(`#question-${questionId} a`)
    ]);
  }
}

module.exports = TaskListPage;
