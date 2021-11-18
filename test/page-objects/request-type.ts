import { BasePage } from 'test/page-objects/base';
import { requestType } from 'app/server/paths';

export class RequestTypePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = requestType;
  }

  async selectRequestOption() {
    await this.selectOption('select#idOfSelect', 'optionValue');
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#submit-buttons button')
    ]);
  }
}
