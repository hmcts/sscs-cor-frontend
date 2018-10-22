import { hearingConfirm } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class HearingConfirmPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = hearingConfirm;
  }

  async clickYes() {
    await this.clickElement('#new-hearing-1');
  }

  async clickNo() {
    await this.clickElement('#new-hearing-2');
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.clickElement('#submit-button button')
    ]);
  }
}
