import { supportWithdrawAppeal } from 'app/server/paths';
import { BasePage } from 'test/page-objects/base';

export class WithdrawAppealPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = supportWithdrawAppeal;
  }
}
