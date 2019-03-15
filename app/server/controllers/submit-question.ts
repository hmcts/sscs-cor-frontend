import { Router, Request, Response, NextFunction } from 'express';
import * as AppInsights from '../app-insights';
import * as Paths from '../paths';
import { QuestionService } from '../services/question';

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getSubmitQuestion(questionService: QuestionService) {
  return (req: Request, res: Response) => {
    const currentQuestionId: string = questionService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const questionOrdinal: string = req.params.questionOrdinal;
    res.render('submit-question.html', { questionOrdinal });
  };
}

function postSubmitAnswer(questionService: QuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const currentQuestionId = questionService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;

    try {
      await questionService.submitAnswer(hearingId, currentQuestionId, req.session.accessToken,
        req.session.serviceToken);

      const response = await questionService.getAllQuestions(hearingId, req.session.accessToken,
        req.session.serviceToken);
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
  const router = Router();
  router.get(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, getSubmitQuestion(deps.questionService));
  router.post(`${Paths.question}/:questionOrdinal/submit`, deps.prereqMiddleware, postSubmitAnswer(deps.questionService));
  return router;
}

export {
  setupSubmitQuestionController,
  getSubmitQuestion,
  postSubmitAnswer
};
