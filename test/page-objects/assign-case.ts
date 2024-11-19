import { assignCase } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class AssignCasePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = assignCase;
  }

  async fillAppealType(appealType) {
    await this.enterTextintoField('#appealType', appealType);
  }

  async fillPostcode(postcode) {
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
