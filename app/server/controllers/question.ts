import * as AppInsights from '../app-insights';
import { NextFunction, Request, Response, Router } from 'express';
import * as Paths from '../paths';
import { answerValidation } from '../utils/fieldValidation';
import * as config from 'config';

export function showEvidenceUpload(evidenceUploadEnabled: boolean, evidendeUploadOverrideAllowed?: boolean, cookies?): boolean {
  if (evidenceUploadEnabled) {
    return true;
  }
  if (evidendeUploadOverrideAllowed && cookies && cookies.evidenceUploadOverride === 'true') {
    return true;
  }
  return false;
}

function getQuestion(getAllQuestionsService, getQuestionService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    const currentQuestionId = getAllQuestionsService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
      return res.redirect(Paths.taskList);
    }
    const hearingId = req.session.hearing.online_hearing_id;
    try {
      const response = await getQuestionService(hearingId, currentQuestionId);

      const question = {
        questionId: currentQuestionId,
        questionOrdinal: questionOrdinal,
        header: response.question_header_text,
        body: response.question_body_text,
        answer_state: response.answer_state,
        answer: {
          value: response.answer,
          date: response.answer_date
        }
      };
      req.session.question = question;
      const evidenceUploadEnabled = config.get('evidenceUpload.questionPage.enabled') === 'true';
      const evidendeUploadOverrideAllowed = config.get('evidenceUpload.questionPage.overrideAllowed') === 'true';
      res.render('question/index.html', {
        question,
        showEvidenceUpload: showEvidenceUpload(evidenceUploadEnabled, evidendeUploadOverrideAllowed, req.cookies)
      });
    } catch (error) {
      AppInsights.trackException(error);
      next(error);
    }
  };
}

function postAnswer(getAllQuestionsService, updateAnswerService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    const questionOrdinal: string = req.params.questionOrdinal;
    const currentQuestionId = getAllQuestionsService.getQuestionIdFromOrdinal(req);
    if (!currentQuestionId) {
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
        await updateAnswerService(hearingId, currentQuestionId, 'draft', answerText);
        if (req.body.submit) {
          res.redirect(`${Paths.question}/${questionOrdinal}/submit`);
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
  router.get('/:questionOrdinal', deps.prereqMiddleware, getQuestion(deps.getAllQuestionsService, deps.getQuestionService));
  router.post('/:questionOrdinal', deps.prereqMiddleware, postAnswer(deps.getAllQuestionsService, deps.saveAnswerService));
  return router;
}

export {
  setupQuestionController,
  getQuestion,
  postAnswer
};
