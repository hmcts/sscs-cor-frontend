import { tribunalView } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class TribunalViewPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = tribunalView;
  }
}