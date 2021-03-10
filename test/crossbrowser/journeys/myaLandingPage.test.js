Feature('Manage your appeal');

Scenario('English - can track appeal status via manager your appeal', async I => {
  await I.loginToANewCase();
  I.verifyAppeallantPostCode();
  I.waitForElement('.govuk-heading-xl', 5);
  I.verifyStatusHeader();
  I.uploadEvidence();
}).retry(2);

Scenario('Welsh - can track appeal status via manager your appeal', async I => {
  await I.loginToANewCase();
  I.verifyWelshAppellantPostCode();
  I.waitForElement('.govuk-heading-xl', 5);
  I.verifyWelshStatusHeader();
  I.uploadWelshEvidence();
}).retry(1);