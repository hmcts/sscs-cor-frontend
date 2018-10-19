import { decision } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class DecisionPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = decision;
  }
}
