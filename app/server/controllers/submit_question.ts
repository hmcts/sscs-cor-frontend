import { Router, Request, Response, NextFunction } from "express";
const appInsights = require('app/server/app-insights');
const paths = require('app/server/paths');

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getSubmitQuestion(req: Request, res: Response) {
  const questionId = req.params.questionId;
  res.render('submit-question.html', { questionId });
}

function postSubmitAnswer(submitAnswerService: any, getAllQuestionsService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearingId = req.session.hearing.online_hearing_id;
    const questionId = req.params.questionId;
    try {
      await submitAnswerService(hearingId, questionId);

      const response = await getAllQuestionsService(hearingId);
      const totalQuestionCount = response.questions.length;
      const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(response.questions);

      if (allQuestionsSubmitted) {
        req.session.questionsCompletedThisSession = true;
        return res.redirect(paths.completed);
      }
      return res.redirect(paths.taskList);
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
  router.post(`${paths.question}/:hearingId/:questionId/submit`, deps.ensureAuthenticated, postSubmitAnswer(deps.submitAnswerService, deps.getAllQuestionsService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
