const express = require('express');
const paths = require('app/server/paths');
const { ensureAuthenticated, setLocals } = require('app/server/middleware/ensure-authenticated');

import { setupQuestionController } from './controllers/question';
import { setupSubmitQuestionController } from './controllers/submit_question';
import { setupTaskListController } from './controllers/taskList';
import { setupLoginController } from './controllers/login';

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/server/services/getQuestion');
const getAllQuestionsService = require('app/server/services/getAllQuestions');
const getOnlineHearingService = require('app/server/services/getOnlineHearing');
const { saveAnswer: saveAnswerService, submitAnswer: submitAnswerService } = require('app/server/services/updateAnswer');

const questionController = setupQuestionController({
  getQuestionService,
  saveAnswerService,
  ensureAuthenticated
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService, ensureAuthenticated });
const taskListController = setupTaskListController({ getAllQuestionsService, ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearingService });

router.use(loginController);
router.use(submitQuestionController);
router.use(paths.question, questionController);
router.use(taskListController);

export { router };