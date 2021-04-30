import { supportHearing } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class SupportHearingPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = supportHearing;
  }
}
