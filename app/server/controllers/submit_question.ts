import { Router, Request, Response, NextFunction } from "express";
const appInsights = require('app/server/app-insights');
const paths = require('app/server/paths');

function getSubmitQuestion(req: Request, res: Response) {
  const questionId = req.params.questionId;
  res.render('submit-question.html', { questionId });
}

function postSubmitAnswer(submitAnswerService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearingId = req.session.hearing.online_hearing_id;
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
  const router = Router();
  router.get(`${paths.question}/:hearingId/:questionId/submit`, deps.ensureAuthenticated, getSubmitQuestion);
  router.post(`${paths.question}/:hearingId/:questionId/submit`, deps.ensureAuthenticated, postSubmitAnswer(deps.submitAnswerService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
