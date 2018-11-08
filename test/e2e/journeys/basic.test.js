Feature('Basic user journey');

Scenario('A PIP appellant can answer a question on their appeal', I => {
  I.loginWithPIPAppellant();
  I.answerQuestion('How do you interact with people?', 'By phone.');
});