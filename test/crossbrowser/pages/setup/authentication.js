async function newSignInFlow(I, username, password) {

  const newUsername = I.locator('#email').first();
  const newPassword = I.locator('#password').first();
  const continueButton = I.locator("//*[@id='main-content']/div/div/form/div[@class='govuk-button-group']/button").first();

  await I.locator("//a[@href='/enter-email']").first().click();
  await newUsername.fill(username);
  console.log('newSignInFlow: username=', username);
  await continueButton.click();
  await expect(newPassword).toBeVisible({ timeout: 5000 });
  await newPassword.fill(password);
  console.log('newSignInFlow: password=', password);
  await continueButton.click();
}

async function oldSignInFlow(I, username, password) {
  await I.locator('#username').first().fill(username);
  await I.locator('#password').first().fill(password);
  await I.locator("[name='save']").first().click();
}

function isNewLoginPresent(I) {
  const loginHeader = I.locator('a[href="/enter-email"]').first();

  return loginHeader
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
}

async function loginJourney(I, username, password) {
  let newLoginPresent = false;

  newLoginPresent = await isNewLoginPresent(I);
  console.log('signIn: newLoginPresent=', newLoginPresent);
  const loginFlow = newLoginPresent ? newSignInFlow : oldSignInFlow;
  await loginFlow(I, username, password);
}

async function loginToANewCase(appealData) {
  const I = this;
  let password = 'Apassword123';

  await I.amOnPage(`/sign-in?tya=${appealData.ccdCase.appellant_tya}`);
  await this.loginJourney(I, appealData.ccdCase.email, password);

  // await I.waitForElement('label:has-text("Email address")', 5);
  // await I.fillField('username', appealData.ccdCase.email);
  // await I.fillField('password', password);
  // await I.click('Sign in');
}

module.exports = { loginToANewCase };
