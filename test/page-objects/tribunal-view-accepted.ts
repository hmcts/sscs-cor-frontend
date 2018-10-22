import { tribunalViewAccepted } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class TribunalViewAcceptedPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = tribunalViewAccepted;
  }
}
