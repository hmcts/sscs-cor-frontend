import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';

export class AdditionalEvidenceConfirmationPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/confirm`;
  }

  async goToTaskList() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#goToTaskList')
    ]);
  }
}
