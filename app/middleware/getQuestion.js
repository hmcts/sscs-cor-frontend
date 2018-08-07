const appInsights = require('app-insights');
const getQuestionService = require('app/services/getQuestion');

function getQuestion(req, res, next) {
  const hearingId = req.params.hearingId;
  const questionId = req.params.questionId;
  return getQuestionService(hearingId, questionId)
    .then(response => {
      res.render('question.html', {
        question: {
          header: response.body.question_header_text
        }
      });
    })
    .catch(error => {
      appInsights.trackException(error);
      next(error);
    });
}

module.exports = getQuestion;
