let appealData = null;

async function loginToANewCase() {
  const I = this;
  appealData = await I.createTestAppealData();

  I.amOnPage(`/sign-in?tya=${appealData.ccdCase.appellant_tya}`);
  I.waitForText('Email address');
  I.fillField('username', appealData.ccdCase.email);
  I.fillField('password', 'Apassword123');
  I.click('Sign in');

  return appealData;
}

module.exports = { loginToANewCase };