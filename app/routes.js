const express = require('express');
const paths = require('paths');

const { setupQuestionController } = require('app/controllers/question');

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/services/getQuestion');
const postAnswerService = require('app/services/postAnswer');

const questionController = setupQuestionController({ getQuestionService, postAnswerService });

router.use(paths.question, questionController);

module.exports = router;
