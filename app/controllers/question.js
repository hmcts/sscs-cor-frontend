const appInsights = require('app-insights');
const express = require('express');
const paths = require('paths');
const { answerValidation } = require('app/utils/fieldValidation');

function getQuestion(getQuestionService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
    try {
      const response = await getQuestionService(hearingId, questionId);
      const question = {
        hearingId,
        questionId,
        header: response.question_header_text,
        body: response.question_body_text,
        answer: {
          value: response.question_answer_text
        }
      };
      req.session.question = question;
      req.session.save();
      res.render('question.html', { question });
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function postAnswer(postAnswerService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
    const answerState = req.body.submit ? '' : 'answer_drafted';
    const answerText = req.body['question-field'];

    const validationMessage = answerValidation(answerText);

    if (validationMessage) {
      const question = req.session.question;
      question.answer = {
        value: answerText,
        error: validationMessage
      };
      res.render('question.html', { question });
    } else {
      try {
        await postAnswerService(hearingId, questionId, answerState, answerText);
        res.redirect(paths.taskList);
      } catch (error) {
        appInsights.trackException(error);
        next(error);
      }
    }
  };
}

function setupQuestionController(deps) {
  // eslint-disable-next-line new-cap
  const router = express.Router();
  router.get('/:hearingId/:questionId', getQuestion(deps.getQuestionService));
  router.post('/:hearingId/:questionId', postAnswer(deps.postAnswerService));
  return router;
}

module.exports = {
  setupQuestionController,
  getQuestion,
  postAnswer
};
