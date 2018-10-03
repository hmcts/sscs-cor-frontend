import * as getAllQuestionsService from 'app/server/services/getAllQuestions.ts';
const mockData = require('test/mock/cor-backend/services/all-questions').template;
const { expect } = require('test/chai-sinon');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const nock = require('nock');
const config = require('config');

const apiUrl = config.get('api.url');

describe('services/getAllQuestions.js', () => {
  describe('#getAllQuestions', () => {
    const hearingId = '121';
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
        expect(getAllQuestionsService.getAllQuestions(hearingId)).to.be.fulfilled
      ));

      it('resolves the promise with the response', () => (
        expect(getAllQuestionsService.getAllQuestions(hearingId)).to.eventually.eql(apiResponse)
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
        expect(getAllQuestionsService.getAllQuestions(hearingId)).to.be.rejectedWith(error)
      ));
    });
  });

  describe('#getQuestionIdFromOrdinal', () => {
    const questions = mockData.questions({})
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
      const firstQuestion = questions[0].question_id;
      expect(getAllQuestionsService.getQuestionIdFromOrdinal(req)).to.deep.equal(firstQuestion);
      req.params.questionOrdinal = '2';
      const secondQuestion = questions[1].question_id;
      expect(getAllQuestionsService.getQuestionIdFromOrdinal(req)).to.deep.equal(secondQuestion);
    });

    it('returns undefined if no questions exist in the session', () => {
      delete req.session.questions;
      expect(getAllQuestionsService.getQuestionIdFromOrdinal(req)).to.be.undefined;
    });

    it('returns undefined if question ordinal param is not valid', () => {
      delete req.params.questionOrdinal;
      expect(getAllQuestionsService.getQuestionIdFromOrdinal(req)).to.be.undefined;
    });
  });
});

export {};