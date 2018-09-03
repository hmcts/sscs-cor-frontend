const appInsights = require('app/server/app-insights');
import moment from 'moment';
import { Router, Request, Response, NextFunction } from "express";
const paths = require('app/server/paths');

const DEADLINE_EXPIRY_DATE_FORMAT = 'D MMMM YYYY';

function processDeadline(expiryDateRaw: any, allQuestionsSubmitted: any) {
  if (allQuestionsSubmitted) {
    return { status: 'completed', formatted: null, extendable: false };
  }
  const expiryDate = moment.utc(expiryDateRaw);
  const formatted = expiryDate.format(DEADLINE_EXPIRY_DATE_FORMAT);
  const endOfToday = moment().utc().endOf('day');
  let status = 'pending';
  if (expiryDate.isBefore(endOfToday)) {
    status = 'expired';
  }
  return { status, formatted, extendable: true };
}

const getSubmittedQuestionCount = (questions: any) => questions.filter((q: any) => q.answer_state === 'submitted').length;

function getTaskList(getAllQuestionsService: any) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const hearing = req.session.hearing;
    const hearingId = (hearing && hearing.online_hearing_id) || req.params.hearingId;
    try {
      const response = await getAllQuestionsService(hearingId);
      const totalQuestionCount = response.questions.length;
      const allQuestionsSubmitted = totalQuestionCount === getSubmittedQuestionCount(response.questions);
      const deadlineDetails = processDeadline(response.deadline_expiry_date, allQuestionsSubmitted);
      res.render('task-list.html', {
        hearingId,
        deadlineExpiryDate: deadlineDetails,
        questions: response.questions
      });
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function setupTaskListController(deps: any): Router {
  const router: Router = Router();
  router.get(paths.taskList, deps.ensureAuthenticated, getTaskList(deps.getAllQuestionsService));
  router.get(`${paths.taskList}/:hearingId`, getTaskList(deps.getAllQuestionsService));
  return router;
}

export {
  setupTaskListController,
  getTaskList,
  processDeadline
};
