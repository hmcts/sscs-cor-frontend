const { getSubmitQuestion, postSubmitAnswer, setupSubmitQuestionController } =
  require('app/controllers/submit_question');
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app-insights');
const paths = require('paths');
const express = require('express');

describe('controllers/question.js', () => {
  const next = sinon.stub();
  const req = {}, res = {};

  req.params = {
    hearingId: '1',
    questionId: '2'
  };

  res.render = sinon.stub();
  res.redirect = sinon.stub();

  beforeEach(() => {
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  describe('getSubmitQuestion', () => {
    it('should call render with the template and hearing/question ids', () => {
      getSubmitQuestion()(req, res, next);
      expect(res.render).to.have.been.calledWith('submit-question.html', {
        question: {
          hearingId: req.params.hearingId,
          questionId: req.params.questionId
        }
      });
    });
  });

  describe('postSubmitAnswer', () => {
    it('should call res.redirect when submitting an answer and there are no errors', async() => {
      const submitAnswerService = () => Promise.resolve();
      await postSubmitAnswer(submitAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(`${paths.taskList}/${req.params.hearingId}`);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      const submitAnswerService = () => Promise.reject(error);
      await postSubmitAnswer(submitAnswerService)(req, res, next);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('setupQuestionController', () => {
    const deps = {
      submitAnswerService: {}
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
      setupSubmitQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(`${paths.question}/:hearingId/:questionId/submit`);
    });

    it('calls router.post with the path and middleware', () => {
      setupSubmitQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(`${paths.question}/:hearingId/:questionId/submit`);
    });

    it('returns the router', () => {
      const controller = setupSubmitQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});