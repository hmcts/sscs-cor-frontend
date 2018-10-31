function loginWithPIPAppellant() {
  const I = this;

  I.amOnPage('/sign-in');
  I.waitForText('Username');
  I.fillField('username', 'test3736222@hmcts.net');
  I.fillField('password', 'Apassword123');
  I.click('login');
}

module.exports = { loginWithPIPAppellant };