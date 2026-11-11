import { status } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class StatusPage extends BasePage {
  locators: any;
  constructor(page) {
    super(page);
    this.pagePath = status;
    this.locators = {
      statusBar: '.status-bar',
      latestUpdatePanelContent: '.panel p',
      contactUsHeading2: '.contact-us h2',
      contactUsHeading3: '.contact-us h3',
      contactUsContent: '.govuk-details__text',
      statusBarStages: '.status-bar .status-bar__stage',
      activeStatusBarStages: '.status-bar .status-bar__stage.stage--active',
    };
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

  async getLatestStatus() {
    const activeStages = await this.page.$$(
      this.locators.activeStatusBarStages
    );
    const appealStages = {
      1: 'appeal',
      2: 'ibca_response',
      3: 'hearing_booked',
      4: 'hearing',
      5: 'closed',
    };
    return appealStages[activeStages.length];
  }
}
