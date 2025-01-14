Feature('Manage your appeal');

let appealData = null;

Before(async ({ I }) => {
  appealData = await I.createTestAppealData();
});

Scenario(
  'English - can track appeal status via manager your appeal',
  async ({ I }) => {
    if (appealData === null) {
      console.log('Failed to create test data');
    } else {
      await I.loginToANewCase(appealData);
      await I.verifyAppeallantPostCode();
      await I.waitForElement('.govuk-heading-xl', 10);
      await I.verifyStatusHeader();
      await I.uploadEvidence();
    }
  }
).retry(2);

Scenario(
  'Welsh - can track appeal status via manager your appeal',
  async ({ I }) => {
    if (appealData === null) {
      console.log('Failed to create test data');
    } else {
      await I.loginToANewCase(appealData);
      await I.verifyWelshAppellantPostCode();
      await I.waitForElement('.govuk-heading-xl', 10);
      await I.verifyWelshStatusHeader();
      await I.uploadWelshEvidence();
    }
  }
).retry(1);

After(async ({ I }) => {
  if (appealData && appealData.sidamUser) {
    await I.deleteUser(appealData.sidamUser);
  }
});
