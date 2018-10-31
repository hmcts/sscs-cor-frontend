Feature('Basic user journey');

Scenario('A PIP appellant can see their appeal', I => {
  I.loginWithPIPAppellant();
  I.waitForText('Your PIP benefit appeal');
});