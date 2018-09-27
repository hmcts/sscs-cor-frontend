const { expect } = require('test/chai-sinon');
import { startServices } from 'test/browser/common';
import { DecisionPage } from 'test/page-objects/decision';
const i18n = require('app/server/locale/en');

describe('Decision page', () => {
  let page;
  let decisionPage;

  before('create and issue decision', async() => {
  });

  before('start services and bootstrap data in CCD/COH', async() => {
    const res = await startServices({ bootstrapData: true, performLogin: true, issueDecision: true });
    page = res.page;
    decisionPage = new DecisionPage(page);
    await decisionPage.screenshot('decision-appeal-upheld');
  });

  after(async() => {
    if (page && page.close) {
      await page.close();
    }
  });

  it('is on the /decision path', async() => {
    decisionPage.verifyPage();
  });

  it('shows appeal-upheld outcome', async() => {
    const outcome = await decisionPage.getElementText('#decision-outcome h2')
    expect(outcome).to.equal(i18n.decision.outcome['appeal-upheld']);
  });
});
