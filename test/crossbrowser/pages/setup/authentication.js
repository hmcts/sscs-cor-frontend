const timeout = 5;
const newLoginLink = 'a[href="/enter-email"]';
const continueButton =
  '#main-content > div > div > form > div.govuk-button-group > button';

async function newSignInFlow(I, username, password) {
  I.click(newLoginLink);
  I.waitForVisible('#email', timeout);
  I.fillField('#email', username);
  I.click(continueButton);
  I.waitForVisible('#password', timeout);
  I.fillField('#password', password);
  I.click(continueButton);
}

async function oldSignInFlow(I, username, password) {
  I.fillField('#username', username);
  I.fillField('#password', password);
  I.click("[name='save']");
}

async function isNewLoginPresent(I) {
  return I.waitForVisible(newLoginLink, timeout)
    .then(() => true)
    .catch(() => false);
}

async function loginJourney(I, username, password) {
  const newLoginPresent = await isNewLoginPresent(I);
  const loginFlow = newLoginPresent ? newSignInFlow : oldSignInFlow;
  await loginFlow(I, username, password);
}

async function loginToANewCase(appealData) {
  const I = this;
  let password = 'Apassword123';

  await I.amOnPage(`/sign-in?tya=${appealData.ccdCase.appellant_tya}`);
  await loginJourney(I, appealData.ccdCase.email, password);

  // await I.waitForElement('label:has-text("Email address")', 5);
  // await I.fillField('username', appealData.ccdCase.email);
  // await I.fillField('password', password);
  // await I.click('Sign in');
}

module.exports = { loginToANewCase };
