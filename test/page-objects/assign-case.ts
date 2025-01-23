import { assignCase } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class AssignCasePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = assignCase;
  }

  async fillPostcode(postcode) {
    await this.clickElement('input#appeal-type-otherBenefits');
    await this.enterTextintoField('#postcode', postcode);
  }

  async submit() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('#assign-case'),
    ]);
  }
}
