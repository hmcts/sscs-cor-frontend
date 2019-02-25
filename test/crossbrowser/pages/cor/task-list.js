const config = require('config');

const timeout = parseInt(config.get('saucelabs.waitForTimeout'));

function answerQuestion(question, answer) {
  const I = this;

  I.waitInUrl('/task-list');
  I.waitForHeader('Your PIP benefit appeal');
  I.waitForText(question, timeout, '#task-list');
  I.click(question);
  I.waitInUrl('/question/');
  I.waitForHeader(question);
  I.waitForVisible('#question-field');
  I.fillField('#question-field', answer);
  I.click('Submit answer to the tribunal');
  I.waitInUrl('/submit');
  I.click('Confirm');
}

function haveAnsweredAllQuestions() {
  const I = this;

  I.waitInUrl('/questions-completed');
  I.waitForHeader('You have answered the tribunal’s questions');
}

module.exports = { answerQuestion, haveAnsweredAllQuestions };