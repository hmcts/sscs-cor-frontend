import { hearingWhy } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class HearingWhyPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = hearingWhy;
  }

  async giveReasonWhy(reason) {
    await this.enterTextintoField('#explain-why', reason);  
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.clickElement(`#submit-button button`)
    ]);
  }
}