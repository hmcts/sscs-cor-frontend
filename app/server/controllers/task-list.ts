import * as AppInsights from '../app-insights';
import * as moment from 'moment';
import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import { QuestionService } from '../services/question';

function processDeadline(expiryDate: string, allQuestionsSubmitted: boolean) {
  if (allQuestionsSubmitted) return { status: 'completed', expiryDate: null, extendable: false };

  const endOfToday = moment.utc().endOf('day');
  const status = moment.utc(expiryDate).isBefore(endOfToday) ? 'expired' : 'pending';

  return { status, expiryDate, extendable: true };
}

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getTaskList(questionService: QuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing = req.session.hearing;
    try {
      const response = await questionService.getAllQuestions(hearing.online_hearing_id);

      req.session.hearing.deadline = response.deadline_expiry_date;
      req.session.questions = response.questions ? response.questions : [];
      req.session.hearing.extensionCount = response.deadline_extension_count;

      const totalQuestionCount = req.session.questions.length;
      let deadlineDetails = null;
      if (totalQuestionCount !== 0) {
        const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(req.session.questions);
        deadlineDetails = processDeadline(response.deadline_expiry_date, allQuestionsSubmitted);
      }
      res.render('task-list.html', {
        deadlineExpiryDate: deadlineDetails,
        questions: req.session.questions
      });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps: any): Router {
  const router: Router = Router();
  router.get(Paths.taskList, deps.prereqMiddleware, getTaskList(deps.questionService));
  return router;
}

export {
  setupTaskListController,
  getTaskList,
  processDeadline
};
