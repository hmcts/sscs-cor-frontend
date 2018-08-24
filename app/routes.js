const express = require('express');
const paths = require('app/server/paths');

const { setupQuestionController } = require('app/controllers/question');
const { setupTaskListController } = require('app/controllers/taskList');

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/services/getQuestion');
const postAnswerService = require('app/services/postAnswer');
const getAllQuestionsService = require('app/services/getAllQuestions');

const questionController = setupQuestionController({ getQuestionService, postAnswerService });

const taskListController = setupTaskListController({ getAllQuestionsService });

router.use(paths.question, questionController);
router.use(paths.taskList, taskListController);

module.exports = router;
