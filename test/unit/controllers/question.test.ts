const { expect, sinon } = require('test/chai-sinon');
const mockData = require('test/mock/cor-backend/services/all-questions').template;
import { getQuestion, postAnswer, setupQuestionController, showEvidenceUpload } from 'app/server/controllers/question';
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
const i18n = require('locale/en');
import * as moment from 'moment';

describe('controllers/question.js', () => {
  const next = sinon.stub();
  const req: any = {};
  const res: any = {};
  const questionId = '001';
  const questionOrdinal = '1';
  const questions = mockData.questions({});

  res.render = sinon.stub();
  res.redirect = sinon.stub();

  beforeEach(() => {
    req.session = {
      hearing: {
        online_hearing_id: '1',
        case_reference: 'SC/123/456',
        appellant_name: 'John Smith'
      },
      questions,
      question: {}
    };
    req.params = {
      questionOrdinal
    };
    req.body = {};
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getQuestion', () => {
    let getQuestionService;
    let getAllQuestionsService;

    beforeEach(() => {
      getQuestionService = null;
      getAllQuestionsService = {
        getQuestionIdFromOrdinal: sinon.stub().returns('001')
      };
    });

    it('should call render with the template and question header', async() => {
      const questionHeading = 'What is the meaning of life?';
      const questionBody = 'Many people ask this question...';
      const questionAnswer = '';
      const questionAnswerState = 'unanswered';
      const questionAnswerDate = moment.utc().format();
      const questionEvidence = [];

      getQuestionService = () => Promise.resolve({
        question_id: questionId,
        question_ordinal: questionOrdinal,
        question_header_text: questionHeading,
        question_body_text: questionBody,
        answer: questionAnswer,
        answer_state: questionAnswerState,
        answer_date: questionAnswerDate,
        evidence: questionEvidence
      });
      await getQuestion(getAllQuestionsService, getQuestionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question/index.html', {
        question: {
          questionId,
          questionOrdinal: '1',
          header: questionHeading,
          body: questionBody,
          answer: {
            value: questionAnswer,
            date: questionAnswerDate
          },
          answer_state: questionAnswerState,
          evidence: questionEvidence
        },
        showEvidenceUpload: false
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getQuestionService = () => Promise.reject(error);
      await getQuestion(getAllQuestionsService, getQuestionService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('redirects to task list if question id is not found', async() => {
      getAllQuestionsService.getQuestionIdFromOrdinal.returns(undefined);
      await getQuestion(getAllQuestionsService, getQuestionService)(req, res, next);
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });
  });

  describe('postAnswer', () => {
    let postAnswerService;
    let getAllQuestionsService;

    beforeEach(() => {
      postAnswerService = null;
      getAllQuestionsService = {
        getQuestionIdFromOrdinal: sinon.stub().returns('001')
      };
    });

    afterEach(() => {
      res.redirect.reset();
    });

    it('should call res.redirect when saving an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      postAnswerService = () => Promise.resolve();
      await postAnswer(getAllQuestionsService, postAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });

    it('should call res.redirect when submitting an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      req.body.submit = 'submit';
      postAnswerService = () => Promise.resolve();
      await postAnswer(getAllQuestionsService, postAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(`${Paths.question}/${questionOrdinal}/submit`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      postAnswerService = () => Promise.reject(error);
      await postAnswer(getAllQuestionsService, postAnswerService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('should call res.render with the validation error message', async () => {
      req.body['question-field'] = '';
      await postAnswer(getAllQuestionsService, postAnswerService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question/index.html', {
        question: {
          answer: {
            value: '',
            error: i18n.question.textareaField.error.empty
          }
        }
      });
    });
  });

  describe('setupQuestionController', () => {
    const deps = {
      getQuestionService: {},
      postAnswerService: {}
    };

    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub()
      });
    });

    afterEach(() => {
      (express.Router as sinon.SinonStub).restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionController(deps);
      expect(express.Router().get).to.have.been.calledWith('/:questionOrdinal');
    });

    it('calls router.post with the path and middleware', () => {
      setupQuestionController(deps);
      expect(express.Router().post).to.have.been.calledWith('/:questionOrdinal');
    });

    it('returns the router', () => {
      const controller = setupQuestionController({ getQuestionService: {} });
      expect(controller).to.equal(express.Router());
    });
  });

  describe('#showEvidenceUpload', () => {
    it('returns true when it\'s enabled', () => {
      expect(showEvidenceUpload(true)).to.be.true;
    });
    it('returns true when it\'s not enabled, override is allowed and cookie is true', () => {
      expect(showEvidenceUpload(false, true, { evidenceUploadOverride: 'true' })).to.be.true;
    });
    it('returns false when it\'s not enabled and override is not allowed', () => {
      expect(showEvidenceUpload(false)).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookies object is undefined', () => {
      expect(showEvidenceUpload(false, true)).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookies object empty', () => {
      expect(showEvidenceUpload(false, true, {})).to.be.false;
    });
    it('returns false when it\'s not enabled, override is allowed but cookie is false', () => {
      expect(showEvidenceUpload(false, true, { evidenceUploadOverride: 'false' })).to.be.false;
    });
    it('returns false when it\'s not enabled, override is not allowed and cookie is true', () => {
      expect(showEvidenceUpload(false, false, { evidenceUploadOverride: 'true' })).to.be.false;
    });
  });
});

export {};
