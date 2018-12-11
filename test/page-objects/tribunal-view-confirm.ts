import { tribunalViewConfirm } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class TribunalViewConfirmPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = tribunalViewConfirm;
  }

  async acceptTribunalsView() {
    await this.clickElement('#accept-view-1');
  }

  async goBack() {
    await this.clickElement('#accept-view-2');
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-button button')
    ]);
  }
}
