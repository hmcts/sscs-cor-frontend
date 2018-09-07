import { Router, Request, Response } from 'express';
const moment = require('moment');
const paths = require('app/server/paths');

const DATE_FORMAT = 'D MMMM YYYY';

function getQuestionsCompleted(req: Request, res: Response) {
  if (req.session.questionsCompletedThisSession) {
    // TODO: refactor to use nunjucks filter
    const nextCorrespondenceDate = moment().add(7, 'days').format(DATE_FORMAT)
    return res.render('questions-completed.html', { nextCorrespondenceDate });
  }
  return res.redirect(paths.taskList);
}

function setupQuestionsCompletedController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(paths.completed, deps.ensureAuthenticated, getQuestionsCompleted);
  return router;
}

export {
  setupQuestionsCompletedController,
  getQuestionsCompleted
};
