const express = require('express');
const paths = require('paths');
const { ensureAuthenticated } = require('app/middleware/ensure-authenticated');

const { setupQuestionController } = require('app/controllers/question');
const { setupSubmitQuestionController } = require('app/controllers/submit_question');
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
  ensureAuthenticated
});
const submitQuestionController = setupSubmitQuestionController({ submitAnswerService });
const taskListController = setupTaskListController({ getAllQuestionsService, ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearingService });

router.use(loginController);
router.use(submitQuestionController);
router.use(paths.question, questionController);
router.use(taskListController);

module.exports = router;
