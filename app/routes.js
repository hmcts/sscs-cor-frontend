const express = require('express');
const paths = require('paths');
const { ensureAuthenticated } = require('app/middleware/ensure-authenticated');

const { setupQuestionController } = require('app/controllers/question');
const { setupTaskListController } = require('app/controllers/taskList');
const { setupLoginController } = require('app/controllers/login');

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/services/getQuestion');
const postAnswerService = require('app/services/postAnswer');
const getAllQuestionsService = require('app/services/getAllQuestions');
const getOnlineHearingService = require('app/services/getOnlineHearing');

const questionController = setupQuestionController({
  getQuestionService,
  postAnswerService,
  ensureAuthenticated
});
const taskListController = setupTaskListController({ getAllQuestionsService, ensureAuthenticated });
const loginController = setupLoginController({ getOnlineHearingService });

router.use(loginController);
router.use(paths.question, questionController);
router.use(taskListController);

module.exports = router;
