import { tribunalView } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class TribunalViewPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = tribunalView;
  }

  async acceptTribunalsView() {
    await this.clickElement(`#accept-view-1`);
  }

  async requestHearing() {
    await this.clickElement(`#accept-view-2`);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      await this.clickElement(`#submit-button button`)
    ]);
  }
}