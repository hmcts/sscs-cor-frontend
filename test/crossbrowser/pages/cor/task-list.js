function answerQuestion(question, answer) {
  const I = this;

  I.waitInUrl('/task-list');
  I.waitForText('Your PIP benefit appeal');
  I.click(question);
  I.waitForText(question);
  I.fillField('#question-field', answer);
  I.click('Submit answer to the tribunal');
  I.waitInUrl('/submit');
  I.click('Confirm');
}

function haveAnsweredAllQuestions() {
  const I = this;

  I.waitInUrl('/questions-completed');
  I.waitForText('You have answered the tribunal’s questions');
}

module.exports = { answerQuestion, haveAnsweredAllQuestions };