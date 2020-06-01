import { Request } from 'express';
import { RequestPromise } from './request-wrapper';

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

  async getAllQuestions(hearingId: string, req: Request): Promise<QuestionRound> {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}`
    }, req);
  }

  async getQuestion(hearingId: string, questionId: string, req: Request) {
    return RequestPromise.request({
      method: 'GET',
      uri: `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}`
    }, req);
  }

  async saveAnswer(hearingId: string, questionId: string, answerState: string, answerText: string, req: Request) {
    return RequestPromise.request({
      method: 'PUT',
      uri: this.buildAnswerUrl(hearingId, questionId),
      body: {
        answer_state: answerState,
        answer: answerText
      }
    }, req);
  }

  async submitAnswer(hearingId: string, questionId: string, req: Request) {
    return RequestPromise.request({
      method: 'POST',
      headers: {  'Content-Length': '0' },
      uri: this.buildAnswerUrl(hearingId, questionId)
    }, req);
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
    return `${this.apiUrl}/api/continuous-online-hearings/${hearingId}/questions/${questionId}`;
  }
}
