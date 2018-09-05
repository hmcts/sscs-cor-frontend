const appInsights = require('app/server/app-insights');
const express = require('express');
const paths = require('app/server/paths');

function getSubmitQuestion() {
  return (req: any, res: any) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
    const question = {
      hearingId,
      questionId
    };
    res.render('submit-question.html', { question });
  };
}

function postSubmitAnswer(submitAnswerService: any) {
  return async(req: any, res: any, next: any) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;

    try {
      await submitAnswerService(hearingId, questionId);
      res.redirect(paths.taskList);
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupSubmitQuestionController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get(`${paths.question}/:hearingId/:questionId/submit`, deps.ensureAuthenticated, getSubmitQuestion());
  router.post(`${paths.question}/:hearingId/:questionId/submit`, deps.ensureAuthenticated, postSubmitAnswer(deps.submitAnswerService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
