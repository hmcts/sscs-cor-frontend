import { status } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class StatusPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = status;
  }
}
