const { tryTo } = require('codeceptjs/effects');

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
  return tryTo(() => I.waitForVisible(newLoginLink, timeout));
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
}

module.exports = { loginToANewCase };
