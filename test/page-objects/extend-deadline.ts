import { extendDeadline } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class ExtendIndexPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = extendDeadline;
  }

  async clickNo() {
    await this.clickElement(`#extend-deadline-1`);
  }

  async clickYes() {
    await this.clickElement(`#extend-deadline-2`);
  }

  async continue() {
    await this.clickElement(`#submit-button button`);
  }

}