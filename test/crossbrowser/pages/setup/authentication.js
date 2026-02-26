async function loginToANewCase(appealData) {
  const I = this;

  await I.amOnPage(`/sign-in?tya=${appealData.ccdCase.appellant_tya}`);
  await I.waitForElement('label:has-text("Email address")', 5);
  await I.fillField('username', appealData.ccdCase.email);
  await I.fillField('password', 'Apassword123');
  await I.click('Sign in');
}

module.exports = { loginToANewCase };
