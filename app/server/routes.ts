const express = require('express');
import * as Paths from 'app/server/paths';
import { ensureAuthenticated } from 'app/server/middleware/ensure-authenticated';

import { setupQuestionController } from './controllers/question';
import { setupSubmitQuestionController } from './controllers/submit-question';
import { setupQuestionsCompletedController } from './controllers/questions-completed';
import { setupTaskListController } from './controllers/task-list';
import { setupLoginController, getLogin } from './controllers/login';
import { setupExtendDeadlineController } from './controllers/extend-deadline';

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/server/services/getQuestion');
const getAllQuestionsService = require('app/server/services/getAllQuestions');
const getOnlineHearingService = require('app/server/services/getOnlineHearing');
const { saveAnswer: saveAnswerService, submitAnswer: submitAnswerService } = require('app/server/services/updateAnswer');

import { extendDeadline as extendDeadlineService } from 'app/server/services/extend-deadline';

const questionController = setupQuestionController({
  getQuestionService,
  saveAnswerService,
  ensureAuthenticated
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService, getAllQuestionsService, ensureAuthenticated });
const questionsCompletedController = setupQuestionsCompletedController({ ensureAuthenticated });
const taskListController = setupTaskListController({ getAllQuestionsService, ensureAuthenticated });
const extendDeadlineController = setupExtendDeadlineController({ getAllQuestionsService, extendDeadlineService, ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearingService });

router.use(loginController);
router.use(submitQuestionController);
router.use(questionsCompletedController);
router.use(Paths.question, questionController);
router.use(taskListController);
router.use(extendDeadlineController);
router.get('/', getLogin);

export { router };