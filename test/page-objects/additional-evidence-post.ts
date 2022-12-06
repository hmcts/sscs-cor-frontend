import * as path from 'path';

import { BasePage } from 'test/page-objects/base';
import { additionalEvidence } from 'app/server/paths';
import { expect } from 'test/chai-sinon';
import content from 'app/common/locale/content.json';

export class AdditionalEvidencePostPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${additionalEvidence}/post`;
  }

  async verifyPages() {
    const title = this.page.title();
    expect(title).to.equal(content.en.additionalEvidence.evidencePost.header);
  }

  async returnToAppealPage() {
    await Promise.all([
      this.page.waitForNavigation(),
      this.clickElement('.govuk-back-link'),
    ]);
  }
}
