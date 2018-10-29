import { Request } from 'express';
const request = require('superagent');

interface QuestionSummary {
  question_id: string;
  question_ordinal: number;
  question_header_text: string;
  answer_state: string;
}

interface QuestionRound {
  deadline_extension_count: number;
  deadline_expiry_date: string;
  questions: QuestionSummary[];
}

export class QuestionService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getAllQuestions(hearingId: string): Promise<QuestionRound> {
    try {
      const response = await request.get(`${this.apiUrl}/continuous-online-hearings/${hearingId}`);
      return Promise.resolve(response.body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getQuestion(hearingId: string, questionId: string) {
    try {
      const response = await request.get(`${this.apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`);
      return Promise.resolve(response.body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getQuestionIdFromOrdinal(req: Request): string {
    const questions: QuestionSummary[] = req.session.questions;
    if (!questions) {
      return undefined;
    }
    const questionOrdinal: number = parseInt(req.params.questionOrdinal, 10);
    const index = questionOrdinal - 1;
    const currentQuestion: QuestionSummary = questions[ index ];
    if (!currentQuestion) {
      return undefined;
    }
    return currentQuestion.question_id;
  }

  buildAnswerUrl(hearingId, questionId) {
    return `${this.apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`;
  }

  async saveAnswer(hearingId: string, questionId: string, answerState: string, answerText: string) {
    try {
      const response = await request
        .put(this.buildAnswerUrl(hearingId, questionId))
        .send({
          answer_state: answerState,
          answer: answerText
        });
      return Promise.resolve(response.body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async submitAnswer(hearingId: string, questionId: string) {
    try {
      const response = await request
        .post(this.buildAnswerUrl(hearingId, questionId))
        .set('Content-Length', '0')
        .send();
      return Promise.resolve(response.body);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
