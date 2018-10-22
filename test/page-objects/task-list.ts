import { taskList } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class TaskListPage extends BasePage {
  constructor(page, hearingId?) {
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

  async clickExtend() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#extend-deadline')
    ]);
  }
}
