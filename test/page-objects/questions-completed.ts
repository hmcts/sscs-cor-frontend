const { completed } = require('app/server/paths');
import { BasePage } from 'test/page-objects/base';

export class QuestionsCompletedPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = completed;
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-answer')
    ]);
  }
}
