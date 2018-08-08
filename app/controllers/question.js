const appInsights = require('app-insights');
const express = require('express');

function getQuestion(getQuestionService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
    try {
      const response = await getQuestionService(hearingId, questionId);
      res.render('question.html', {
        question: {
          header: response.question_header_text
        }
      });
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupQuestionController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get('/:hearingId/:questionId', getQuestion(deps.getQuestionService));
  return router;
}

module.exports = {
  setupQuestionController,
  getQuestion
};
