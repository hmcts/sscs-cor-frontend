import * as path from 'path';
const { expect } = require('test/chai-sinon');
import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
const i18n = require('locale/content');

export class AdditionalEvidencePostPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/post`;
  }

  async verifyPages() {
    const headerText = this.page.getHeading();
    expect(headerText).to.equal(i18n.en.additionalEvidence.evidencePost.header);
  }

  async returnToAppealPage() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('.govuk-back-link')
    ]);
  }
}
