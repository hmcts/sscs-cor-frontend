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
          value: response.answer
        }
      };
      req.session.question = question;
      res.render('question.html', { question });
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function postAnswer(updateAnswerService) {
  return async(req, res, next) => {
    const hearingId = req.params.hearingId;
    const questionId = req.params.questionId;
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
        await updateAnswerService(hearingId, questionId, 'draft', answerText);
        if (req.body.submit) {
          res.redirect(`${paths.question}/${hearingId}/${questionId}/submit`);
        } else {
          res.redirect(`${paths.taskList}/${hearingId}`);
        }
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
  router.post('/:hearingId/:questionId', postAnswer(deps.saveAnswerService));
  return router;
}

module.exports = {
  setupQuestionController,
  getQuestion,
  postAnswer
};
