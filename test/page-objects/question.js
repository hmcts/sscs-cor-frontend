const { question } = require('paths');
const BasePage = require('test/page-objects/base');

class QuestionPage extends BasePage {
  constructor(page, hearingId, questionId) {
    super(page);
    this.pagePath = `${question}/${hearingId}/${questionId}`;
  }
}

module.exports = QuestionPage;
