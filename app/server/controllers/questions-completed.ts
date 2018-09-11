import { Router, Request, Response } from 'express';
import moment from 'moment';
const paths = require('app/server/paths');

function getQuestionsCompleted(req: Request, res: Response) {
  if (req.session.questionsCompletedThisSession) {
    const nextCorrespondenceDate = moment().utc().add(7, 'days').format();
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
