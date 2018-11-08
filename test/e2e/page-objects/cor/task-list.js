const content = require('locale/en');

function answerQuestion(question, answer) {
  const I = this;

  I.waitForText(content.taskList.header);
  I.click(question);
  I.waitForText(question);
  I.fillField('#question-field', answer);
  // I.click('Submit answer to the tribunal');   // TODO: this can be un-commented once unique users can be setup
}

module.exports = { answerQuestion };