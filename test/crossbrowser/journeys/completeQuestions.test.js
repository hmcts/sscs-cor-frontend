Feature('Complete all COR questions');

Scenario('A PIP appellant can answer all questions for their appeal', async I => {
  await I.loginToANewCase();
  I.answerQuestion('How do you interact with people?', 'By phone.');
  I.answerQuestion('How do you walk to the doctors?', 'By foot.');
  I.answerQuestion('Tell us about your migraines', 'Extreme pain.');
  I.haveAnsweredAllQuestions();
  I.click('Exit service');
  I.waitInUrl('/login');
}).retry(2);