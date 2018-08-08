const { expect, sinon } = require('test/chai-sinon');
const { getQuestion, setupQuestionController } = require('app/controllers/question');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app-insights');
const express = require('express');

describe('question.js', () => {
  const next = sinon.stub();
  const req = {}, res = {};

  req.params = {
    hearingId: '1',
    questionId: '2'
  };

  res.render = sinon.stub();

  describe('getQuestion', () => {
    // eslint-disable-next-line init-declarations
    let questionService;

    beforeEach(() => {
      questionService = null;
      sinon.stub(appInsights, 'trackException');
    });

    afterEach(() => {
      appInsights.trackException.restore();
    });

    it('should call render with the template and question header', async() => {
      const questionHeading = 'What is the meaning of life?';
      questionService = () => Promise.resolve({ question_header_text: questionHeading });
      await getQuestion(questionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question.html', {
        question: {
          header: questionHeading
        }
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      questionService = () => Promise.reject(error);
      await getQuestion(questionService)(req, res, next);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('setupQuestionController', () => {
    beforeEach(() => {
      sinon.stub(express, 'Router').returns({ get: sinon.stub() });
    });

    afterEach(() => {
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionController({ getQuestionService: {} });
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith('/:hearingId/:questionId');
    });

    it('returns the router', () => {
      const controller = setupQuestionController({ getQuestionService: {} });
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
