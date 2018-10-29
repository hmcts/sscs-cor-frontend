import { Request } from 'express';
const config = require('config');
const request = require('superagent');

const apiUrl = config.get('api.url');

interface QuestionSummary {
  question_id: string;
  question_ordinal: number;
  question_header_text: string;
  answer_state: string;
}

interface QuestionRound {
  deadline_expiry_date: string;
  questions: QuestionSummary[];
}

async function getAllQuestions(hearingId): Promise<QuestionRound> {
  try {
    const response = await request.get(`${apiUrl}/continuous-online-hearings/${hearingId}`);
    return Promise.resolve(response.body);
  } catch (error) {
    return Promise.reject(error);
  }
}

function getQuestionIdFromOrdinal(req: Request): string {
  const questions: QuestionSummary[] = req.session.questions;
  if (!questions) {
    return undefined;
  }
  const questionOrdinal: number = parseInt(req.params.questionOrdinal, 10);
  const index = questionOrdinal - 1;
  const currentQuestion: QuestionSummary = questions[index];
  if (!currentQuestion) {
    return undefined;
  }
  return currentQuestion.question_id;
}

export {
  getAllQuestions,
  getQuestionIdFromOrdinal
};
