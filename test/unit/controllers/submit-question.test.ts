const { getSubmitQuestion, postSubmitAnswer, setupSubmitQuestionController } = require('app/server/controllers/submit-question.ts');
const { expect, sinon } = require('test/chai-sinon');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
const express = require('express');

describe('controllers/submit-question', () => {
  const next = sinon.stub();
  const req: any = {};
  const res: any = {};
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };
  const questions = answerState => [
    {
      question_id: '001',
      question_header_text: 'How do you interact with people?',
      answer_state: answerState
    }
  ];

  req.params = {
    questionId: '2'
  };

  req.session = {
    hearing: hearingDetails
  };

  res.render = sinon.stub();
  res.redirect = sinon.stub();

  beforeEach(() => {
    res.render.reset();
    res.redirect.reset();
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getSubmitQuestion', () => {
    it('should call render with the template and hearing/question ids', () => {
      getSubmitQuestion(req, res);
      expect(res.render).to.have.been.calledWith('submit-question.html', {
        questionId: req.params.questionId
      });
    });
  });

  describe('postSubmitAnswer', () => {
    it('redirects to /task-list', async() => {
      const submitAnswerService = () => Promise.resolve();
      const getAllQuestionsService = () => Promise.resolve({ questions: questions('draft') });
      await postSubmitAnswer(submitAnswerService, getAllQuestionsService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      const submitAnswerService = () => Promise.reject(error);
      await postSubmitAnswer(submitAnswerService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    describe('when all questions are submitted', () => {
      let submitAnswerService;
      let getAllQuestionsService;

      beforeEach(() => {
        submitAnswerService = () => Promise.resolve();
        getAllQuestionsService = () => Promise.resolve({ questions: questions('submitted') });
      });

      it('sets questionsCompletedThisSession on the session', async() => {
        await postSubmitAnswer(submitAnswerService, getAllQuestionsService)(req, res, next);
        expect(req.session).to.have.property('questionsCompletedThisSession', true);
      });

      it('redirects to questions completed if all are /questions-completed', async() => {
        await postSubmitAnswer(submitAnswerService, getAllQuestionsService)(req, res, next);
        expect(res.redirect).to.have.been.calledWith(Paths.completed);
      });
    });
  });

  describe('setupQuestionController', () => {
    const deps: any = {
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
      expect(express.Router().get).to.have.been.calledWith(`${Paths.question}/:hearingId/:questionId/submit`);
    });

    it('calls router.post with the path and middleware', () => {
      setupSubmitQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(`${Paths.question}/:hearingId/:questionId/submit`);
    });

    it('returns the router', () => {
      const controller = setupSubmitQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});

export {};