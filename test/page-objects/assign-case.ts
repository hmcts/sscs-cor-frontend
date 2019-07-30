import { assignCase } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class AssignCasePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = assignCase;
  }

  async clickAssign() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-button')
    ]);
  }
}
