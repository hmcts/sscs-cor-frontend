Feature('Manage your appeal');

Scenario('can track appeal status via manager your appeal', async I => {
  await I.loginToANewCase();
  I.verifyAppeallantPostCode();
  I.waitForElement('.govuk-heading-xl', 5);
  I.verifyStatusHeader();
}).retry(1);