import { supportEvidence } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class SupportEvidencePage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = supportEvidence;
  }
}
