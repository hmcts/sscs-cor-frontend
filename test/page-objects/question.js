const { question } = require('paths');
const BasePage = require('test/page-objects/base');
const hearingId = '121';
const questionId = '62';

class QuestionPage extends BasePage {
  constructor(page) {
    super(page);
    this.pagePath = `${question}/${hearingId}/${questionId}`;
  }
}

module.exports = QuestionPage;
