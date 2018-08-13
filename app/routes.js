const express = require('express');
const paths = require('paths');

const { setupQuestionController } = require('app/controllers/question');

// eslint-disable-next-line new-cap
const router = express.Router();

const getQuestionService = require('app/services/getQuestion');

const questionController = setupQuestionController({ getQuestionService });
router.use(paths.question, questionController);

module.exports = router;
