const express = require('express');
import * as Paths from './paths';
import { ensureAuthenticated } from './middleware/ensure-authenticated';
import { checkDecision } from './middleware/check-decision'

import { setupQuestionController } from './controllers/question';
import { setupSubmitQuestionController } from './controllers/submit-question';
import { setupQuestionsCompletedController } from './controllers/questions-completed';
import { setupTaskListController } from './controllers/task-list';
import { setupLoginController, getLogin } from './controllers/login';
import { setupExtendDeadlineController } from './controllers/extend-deadline';
import { setupDecisionController } from './controllers/decision';

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('./services/getQuestion');
const getAllQuestionsService = require('./services/getAllQuestions');
import { getOnlineHearing } from './services/getOnlineHearing';
const { saveAnswer: saveAnswerService, submitAnswer: submitAnswerService } = require('./services/updateAnswer');

import { extendDeadline as extendDeadlineService } from './services/extend-deadline';
const prereqMiddleware = [ensureAuthenticated, checkDecision];

const questionController = setupQuestionController({
  getQuestionService,
  saveAnswerService,
  prereqMiddleware
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService, getAllQuestionsService, prereqMiddleware });
const questionsCompletedController = setupQuestionsCompletedController({ prereqMiddleware });
const taskListController = setupTaskListController({ getAllQuestionsService, prereqMiddleware });
const extendDeadlineController = setupExtendDeadlineController({ extendDeadlineService, prereqMiddleware });
const decisionController = setupDecisionController({ prereqMiddleware: ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearing });

router.use(loginController);
router.use(submitQuestionController);
router.use(questionsCompletedController);
router.use(Paths.question, questionController);
router.use(taskListController);
router.use(extendDeadlineController);
router.use(decisionController);
router.get('/', getLogin);

export { router };