async function loginToANewCase(appealData) {
  const I = this;

  await I.amOnPage(`/sign-in?tya=${appealData.ccdCase.appellant_tya}`);
  await I.waitForText('Email address');
  await I.fillField('username', appealData.ccdCase.email);
  await I.fillField('password', 'Apassword123');
  await I.click('Sign in');
}

module.exports = { loginToANewCase };
