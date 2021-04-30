import { supportHearingExpenses } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class ClaimingExpensesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = supportHearingExpenses;
  }
}
