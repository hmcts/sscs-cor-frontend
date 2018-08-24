const { expect, sinon } = require('test/chai-sinon');
const { getQuestion, postAnswer, setupQuestionController } = require('app/controllers/question');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app/server/app-insights');
const express = require('express');
const paths = require('app/server/paths');
const i18n = require('app/locale/en');

describe('controllers/question.js', () => {
  const next = sinon.stub();
  const req = {}, res = {};

  req.params = {
    hearingId: '1',
    questionId: '2'
  };
  req.session = {
    save: sinon.stub()
  };
  req.body = {};

  res.render = sinon.stub();
  res.redirect = sinon.stub();

  beforeEach(() => {
    req.session.question = {};
    req.body = {};
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  describe('getQuestion', () => {
    // eslint-disable-next-line init-declarations
    let getQuestionService;

    beforeEach(() => {
      getQuestionService = null;
    });

    it('should call render with the template and question header', async() => {
      const questionHeading = 'What is the meaning of life?';
      const questionBody = 'Many people ask this question...';
      const questionAnswer = '';
      getQuestionService = () => Promise.resolve({
        question_header_text: questionHeading,
        question_body_text: questionBody,
        answer: questionAnswer
      });
      await getQuestion(getQuestionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question.html', {
        question: {
          hearingId: req.params.hearingId,
          questionId: req.params.questionId,
          header: questionHeading,
          body: questionBody,
          answer: { value: questionAnswer }
        }
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getQuestionService = () => Promise.reject(error);
      await getQuestion(getQuestionService)(req, res, next);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postAnswer', () => {
    // eslint-disable-next-line init-declarations
    let postAnswerService;

    beforeEach(() => {
      postAnswerService = null;
    });

    it('should call res.redirect when saving an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      postAnswerService = () => Promise.resolve();
      await postAnswer(postAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(`${paths.taskList}/${req.params.hearingId}`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      postAnswerService = () => Promise.reject(error);
      await postAnswer(postAnswerService)(req, res, next);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('should call res.render with the validation error message', () => {
      req.body['question-field'] = '';
      postAnswer(postAnswerService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question.html', {
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
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith('/:hearingId/:questionId');
    });

    it('calls router.post with the path and middleware', () => {
      setupQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith('/:hearingId/:questionId');
    });

    it('returns the router', () => {
      const controller = setupQuestionController({ getQuestionService: {} });
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
