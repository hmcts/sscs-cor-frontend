import { assignCase } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';
import config from 'config';

export class AssignCasePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = assignCase;
  }

  async fillPostcode(postcode) {
    if (config.get('featureFlags.allowContactUs.ibcaEnabled')) {
      await this.clickElement('input#appeal-type-otherBenefits');
    }
    await this.enterTextintoField('#postcode', postcode);
  }

  async fillIbcaReference(ibcaReference) {
    await this.enterTextintoField('#ibcaReference', ibcaReference);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#assign-case'),
    ]);
  }
}
