import { Router, Request, Response, NextFunction } from "express";
import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
import { getCurrentQuestion } from 'app/server/controllers/question'

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getSubmitQuestion(req: Request, res: Response) {
  const questionOrdinal = parseInt(req.params.questionOrdinal, 10);
  if (!req.session.questions) {
    return res.redirect(Paths.taskList);
  }
  const currentQuestion = req.session.questions.find(q => q.question_ordinal === questionOrdinal);
  res.render('submit-question.html', currentQuestion);
}

function postSubmitAnswer(submitAnswerService: any, getAllQuestionsService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const currentQuestion = getCurrentQuestion(req);
    if (!currentQuestion) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;

    try {
      await submitAnswerService(hearingId, currentQuestion.question_id);

      const response = await getAllQuestionsService(hearingId);
      const totalQuestionCount = response.questions.length;
      const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(response.questions);

      if (allQuestionsSubmitted) {
        req.session.questionsCompletedThisSession = true;
        return res.redirect(Paths.completed);
      }
      return res.redirect(Paths.taskList);
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupSubmitQuestionController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, getSubmitQuestion);
  router.post(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, postSubmitAnswer(deps.submitAnswerService, deps.getAllQuestionsService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
