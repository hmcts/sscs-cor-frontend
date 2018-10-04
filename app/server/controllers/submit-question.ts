import { Router, Request, Response, NextFunction } from "express";
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getSubmitQuestion(getAllQuestionsService: any) {
  return (req: Request, res: Response) => {
    const currentQuestionId: string = getAllQuestionsService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const questionOrdinal: number = parseInt(req.params.questionOrdinal, 10);
    res.render('submit-question.html', { questionOrdinal });
  }
}

function postSubmitAnswer(submitAnswerService: any, getAllQuestionsService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const currentQuestionId = getAllQuestionsService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;

    try {
      await submitAnswerService(hearingId, currentQuestionId);

      const response = await getAllQuestionsService.getAllQuestions(hearingId);
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
  router.get(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, getSubmitQuestion(deps.getAllQuestionsService));
  router.post(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, postSubmitAnswer(deps.submitAnswerService, deps.getAllQuestionsService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
