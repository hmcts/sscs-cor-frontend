const appInsights = require('app/server/app-insights');
const express = require('express');
const paths = require('app/server/paths');
const { answerValidation } = require('app/server/utils/fieldValidation');

function getQuestion(getQuestionService) {
  return async(req, res, next) => {
    const hearingId = req.session.hearing.online_hearing_id;
    const questionId = req.params.questionId;
    try {
      const response = await getQuestionService(hearingId, questionId);

      const question = {
        questionId,
        header: response.question_header_text,
        body: response.question_body_text,
        answer_state: response.answer_state,
        answer: {
          value: response.answer,
          datetime: response.answer_datetime
        }
      };
      req.session.question = question;
      res.render('question/index.html', { question });
    } catch (error) {
      appInsights.trackException(error);
      next(error);
    }
  };
}

function postAnswer(updateAnswerService) {
  return async(req, res, next) => {
    const hearingId = req.session.hearing.online_hearing_id;
    const questionId = req.params.questionId;
    const answerText = req.body['question-field'];

    const validationMessage = answerValidation(answerText);

    if (validationMessage) {
      const question = req.session.question;
      question.answer = {
        value: answerText,
        error: validationMessage
      };
      res.render('question/index.html', { question });
    } else {
      try {
        await updateAnswerService(hearingId, questionId, 'draft', answerText);
        if (req.body.submit) {
          res.redirect(`${paths.question}/${hearingId}/${questionId}/submit`);
        } else {
          res.redirect(paths.taskList);
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
  router.get('/:hearingId/:questionId', deps.ensureAuthenticated, getQuestion(deps.getQuestionService));
  router.post('/:hearingId/:questionId', deps.ensureAuthenticated, postAnswer(deps.saveAnswerService));
  return router;
}

export {
  setupQuestionController,
  getQuestion,
  postAnswer
};
