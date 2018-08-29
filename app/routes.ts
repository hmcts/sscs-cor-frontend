const express = require('express');
const paths = require('app/server/paths');
const { ensureAuthenticated, setLocals } = require('app/middleware/ensure-authenticated');

const { setupQuestionController } = require('app/controllers/question');
import { setupSubmitQuestionController } from './server/controllers/submit_question';
const { setupTaskListController } = require('app/controllers/taskList');
const { setupLoginController } = require('app/controllers/login');

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/services/getQuestion');
const getAllQuestionsService = require('app/services/getAllQuestions');
const getOnlineHearingService = require('app/services/getOnlineHearing');
const { saveAnswer: saveAnswerService, submitAnswer: submitAnswerService } = require('app/services/updateAnswer');

const questionController = setupQuestionController({
  getQuestionService,
  saveAnswerService,
  // just passing setLocals to ensure the case_reference is available if logged in
  // this will need to be changed when handling auth properly using IDAM
  setLocals
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService });
const taskListController = setupTaskListController({ getAllQuestionsService, ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearingService });

router.use(loginController);
router.use(submitQuestionController);
router.use(paths.question, questionController);
router.use(taskListController);

export { router };