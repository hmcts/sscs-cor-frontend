const express = require('express');
const paths = require('paths');

const { setupQuestionController } = require('app/controllers/question');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get(paths.helloWorld, (req, res) => {
  res.render('hello-world.html');
});

const getQuestionService = require('app/services/getQuestion');

const questionController = setupQuestionController({ getQuestionService });
router.use(paths.question, questionController);

module.exports = router;
