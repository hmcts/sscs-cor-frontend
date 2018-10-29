import { QuestionService } from 'app/server/services/question';
const mockData = require('test/mock/cor-backend/services/all-questions').template;
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR, NO_CONTENT } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/question', () => {
  const hearingId = '121';
  const questionId = '62';
  let questionService;
  before(() => {
    questionService = new QuestionService(apiUrl);
  });
  describe('#getAllQuestions', () => {
    const path = `/continuous-online-hearings/${hearingId}`;

    const apiResponse = {
      deadline_extension_count: 0,
      questions: [
        {
          question_id: '001',
          question_header_text: 'How do you interact with people?',
          answer_state: 'draft'
        }
      ]
    };

    describe('resolving the promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .reply(OK, apiResponse);
      });

      it('resolves the promise', () => (
        expect(questionService.getAllQuestions(hearingId)).to.be.fulfilled
      ));

      it('resolves the promise with the response', () => (
        expect(questionService.getAllQuestions(hearingId)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(questionService.getAllQuestions(hearingId)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#getQuestionIdFromOrdinal', () => {
    const questions = mockData.questions({});
    const questionOrdinal = '1';
    let req: any = {};

    beforeEach(() => {
      req.session = {
        hearing: {
          online_hearing_id: '1',
          case_reference: 'SC/123/456',
          appellant_name: 'John Smith'
        },
        questions
      };
      req.params = {
        questionOrdinal
      };
    });
    it('returns the question id specified by the ordinal', () => {
      const firstQuestion = questions[ 0 ].question_id;
      expect(questionService.getQuestionIdFromOrdinal(req)).to.deep.equal(firstQuestion);
      req.params.questionOrdinal = '2';
      const secondQuestion = questions[ 1 ].question_id;
      expect(questionService.getQuestionIdFromOrdinal(req)).to.deep.equal(secondQuestion);
    });

    it('returns undefined if no questions exist in the session', () => {
      delete req.session.questions;
      expect(questionService.getQuestionIdFromOrdinal(req)).to.be.undefined;
    });

    it('returns undefined if question ordinal param is not valid', () => {
      delete req.params.questionOrdinal;
      expect(questionService.getQuestionIdFromOrdinal(req)).to.be.undefined;
    });
  });

  describe('#getQuestion', () => {
    const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

    const apiResponse = {
      question_id: questionId,
      question_header_text: 'What is the meaning of life?'
    };

    describe('resolving the promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .reply(OK, apiResponse);
      });

      it('resolves the promise', () => (
        expect(questionService.getQuestion(hearingId, questionId)).to.be.fulfilled
      ));

      it('resolves the promise with the response', () => (
        expect(questionService.getQuestion(hearingId, questionId)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .get(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(questionService.getQuestion(hearingId, questionId)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#saveAnswer', () => {
    /* tslint:disable-next-line variable-name */
    const answer_state = 'draft';
    const answer = 'My answer';
    const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

    const apiResponse = {
      answer_id: '001'
    };

    describe('resolving the save answer promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .put(path, {
            answer_state,
            answer
          })
          .reply(NO_CONTENT, apiResponse);
      });

      it('resolves the promise with the response', () => (
        expect(questionService.saveAnswer(hearingId, questionId, answer_state, answer)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .put(path, {
            answer_state,
            answer
          })
          .replyWithError(error);
      });

      it('rejects the save answer promise with the error', () => (
        expect(questionService.saveAnswer(hearingId, questionId, answer_state, answer)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#submitAnswer', () => {
    const answer = 'My answer';
    const path = `/continuous-online-hearings/${hearingId}/questions/${questionId}`;

    const apiResponse = {
      answer_id: '001'
    };
    describe('resolving the submit answer promise', () => {
      beforeEach(() => {
        nock(apiUrl)
          .post(path)
          .reply(NO_CONTENT, apiResponse);
      });

      it('resolves the promise with the response', () => (
        expect(questionService.submitAnswer(hearingId, questionId)).to.eventually.eql(apiResponse)
      ));
    });

    describe('rejecting the submit answer promise', () => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };

      beforeEach(() => {
        nock(apiUrl)
          .post(path)
          .replyWithError(error);
      });

      it('rejects the promise with the error', () => (
        expect(questionService.submitAnswer(hearingId, questionId)).to.be.rejectedWith(error)
      ));
    });
  });

});
