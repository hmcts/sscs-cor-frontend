import { status } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class StatusPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = status;
  }

  async provideEvidence() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#tab-questions'),
    ]);
  }

  async navigateToAppealDetailsPage() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('a[href="/your-details"]'),
    ]);
  }
}
