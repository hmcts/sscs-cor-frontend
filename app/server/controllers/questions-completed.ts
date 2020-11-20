import { Router, Request, Response } from 'express';
import * as moment from 'moment';
import * as Paths from '../paths';

function getQuestionsCompleted(req: Request, res: Response) {
  if (req.session['questionsCompletedThisSession']) {
    const nextCorrespondenceDate = moment.utc().add(7, 'days').format();
    return res.render('questions-completed.html', { nextCorrespondenceDate });
  }
  return res.redirect(Paths.taskList);
}

function setupQuestionsCompletedController(deps: any) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get(Paths.completed, deps.prereqMiddleware, getQuestionsCompleted);
  return router;
}

export {
  setupQuestionsCompletedController,
  getQuestionsCompleted
};
