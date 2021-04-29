import { hearing } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class HearingPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = hearing;
  }

  async navigateToHearingPage() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#tab-hearing')
    ]);
  }
}
