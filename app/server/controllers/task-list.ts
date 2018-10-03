import * as AppInsights from 'app/server/app-insights';
import * as moment from 'moment';
import { Router, Request, Response, NextFunction } from "express";
import * as Paths from 'app/server/paths';

function processDeadline(expiryDate: Date, allQuestionsSubmitted: boolean) {
  if (allQuestionsSubmitted) return { status: 'completed', expiryDate: null, extendable: false };

  const endOfToday = moment().utc().endOf('day');
  const status = moment.utc(expiryDate).isBefore(endOfToday) ? 'expired' : 'pending';

  return { status, expiryDate, extendable: true };
}

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getTaskList(getAllQuestionsService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing = req.session.hearing;
    try {
      const response = await getAllQuestionsService.getAllQuestions(hearing.online_hearing_id);

      req.session.hearing.deadline = response.deadline_expiry_date;
      req.session.questions = response.questions;
      req.session.hearing.extensionCount = response.deadline_extension_count;

      const totalQuestionCount = response.questions.length;
      const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(response.questions);
      const deadlineDetails = processDeadline(response.deadline_expiry_date, allQuestionsSubmitted);
      res.render('task-list.html', {
        deadlineExpiryDate: deadlineDetails,
        questions: response.questions
      });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps: any): Router {
  const router: Router = Router();
  router.get(Paths.taskList, deps.prereqMiddleware, getTaskList(deps.getAllQuestionsService));
  return router;
}

export {
  setupTaskListController,
  getTaskList,
  processDeadline
};
