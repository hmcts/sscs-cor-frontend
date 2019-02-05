import { Request } from 'express';
const request = require('request-promise');
const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('question.ts');
const timeout = 40 * 1000;

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
      const body = await request.get({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}`,
        json: true,
        timeout
      });
      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error getAllQuestions', error);
      return Promise.reject(error);
    }
  }

  async getQuestion(hearingId: string, questionId: string) {
    try {
      const body = await request.get({
        uri: `${this.apiUrl}/continuous-online-hearings/${hearingId}/questions/${questionId}`,
        json: true,
        timeout
      });
      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error getQuestion', error);
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
      const body = await request.put({
        uri: this.buildAnswerUrl(hearingId, questionId),
        body: {
          answer_state: answerState,
          answer: answerText
        },
        json: true,
        timeout
      });
      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error saveAnswer', error);
      return Promise.reject(error);
    }
  }

  async submitAnswer(hearingId: string, questionId: string) {
    try {
      const body = await request.post({
        uri: this.buildAnswerUrl(hearingId, questionId),
        headers: {
          'Content-Length': '0'
        },
        json: true,
        timeout
      });
      return Promise.resolve(body);
    } catch (error) {
      logger.error('Error submitAnswer', error);
      return Promise.reject(error);
    }
  }
}
