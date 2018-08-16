const { taskList } = require('paths');
const BasePage = require('test/page-objects/base');

class TaskListPage extends BasePage {
  constructor(page, hearingId) {
    super(page);
    this.page = page;
    this.pagePath = `${taskList}/${hearingId}`;
  }

  async clickQuestion(questionId) {
    await this.clickElement(`#question-${questionId} a`);
  }
}

module.exports = TaskListPage;
