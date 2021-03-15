import { yourDetails } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class AppealDetailsPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = yourDetails;
  }
}
