const appInsights = require('app-insights');
const express = require('express');
const paths = require('paths');

function getSubmitQuestion() {
  return (req, res) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
    const question = {
      hearingId,
      questionId
    };
    res.render('submit-question.html', { question });
  };
}

function postSubmitAnswer(submitAnswerService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;

    try {
      await submitAnswerService(hearingId, questionId);
      res.redirect(`${paths.taskList}/${hearingId}`);
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupSubmitQuestionController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get(`${paths.question}/:hearingId/:questionId/submit`, getSubmitQuestion());
  router.post(`${paths.question}/:hearingId/:questionId/submit`, postSubmitAnswer(deps.submitAnswerService));
  return router;
}

module.exports = {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
