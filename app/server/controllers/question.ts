import * as AppInsights from 'app/server/app-insights';
import { NextFunction, Request, Response, Router } from 'express'
import * as Paths from 'app/server/paths';
import { answerValidation } from 'app/server/utils/fieldValidation';

export function getCurrentQuestion(req: Request) {
  if (!req.session.questions) {
    return undefined;
  }
  const questionOrdinal = parseInt(req.params.questionOrdinal, 10);
  const currentQuestion = req.session.questions.find(q => q.question_ordinal === questionOrdinal);
  if (!currentQuestion) {
    return undefined;
  }
  return currentQuestion;
}

function getQuestion(getQuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const currentQuestion = getCurrentQuestion(req);
    if (!currentQuestion) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;
    try {
      const response = await getQuestionService(hearingId, currentQuestion.question_id);

      const question = {
        questionId: currentQuestion.question_id,
        questionOrdinal: response.question_ordinal,
        header: response.question_header_text,
        body: response.question_body_text,
        answer_state: response.answer_state,
        answer: {
          value: response.answer,
          date: response.answer_date
        }
      };
      req.session.question = question;
      res.render('question/index.html', { question });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function postAnswer(updateAnswerService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const currentQuestion = getCurrentQuestion(req);
    if (!currentQuestion) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;
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
        await updateAnswerService(hearingId, currentQuestion.question_id, 'draft', answerText);
        if (req.body.submit) {
          res.redirect(`${Paths.question}/${currentQuestion.question_ordinal}/submit`);
        } else {
          res.redirect(Paths.taskList);
        }
      } catch (error) {
        AppInsights.trackException(error);
        next(error);
      }
    }
  };
}

function setupQuestionController(deps) {
  // eslint-disable-next-line new-cap
  const router = Router();
  router.get('/:questionOrdinal', deps.prereqMiddleware, getQuestion(deps.getQuestionService));
  router.post('/:questionOrdinal', deps.prereqMiddleware, postAnswer(deps.saveAnswerService));
  return router;
}

export {
  setupQuestionController,
  getQuestion,
  postAnswer
};
