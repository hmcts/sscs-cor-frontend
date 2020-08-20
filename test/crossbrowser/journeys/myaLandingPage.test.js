Feature('Complete all COR questions');

Scenario('A PIP appellant can answer all questions for their appeal', async I => {
  await I.loginToANewCase();
  I.verifyAppeallantPostCode();
  I.waitForElement('.govuk-heading-xl', 5);
  I.verifyStatusHeader();
}).retry(1);
