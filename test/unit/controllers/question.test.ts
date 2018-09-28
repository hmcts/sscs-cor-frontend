const { expect, sinon } = require('test/chai-sinon');
const { getQuestion, postAnswer, setupQuestionController } = require('app/server/controllers/question.ts');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
const express = require('express');
import * as Paths from 'app/server/paths';
const i18n = require('app/server/locale/en');
import * as moment from 'moment'; 

describe('controllers/question.js', () => {
  const next = sinon.stub();
  const req: any = {}
  const res: any = {};
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };

  req.params = {
    questionId: '2'
  };
  req.session = {
    hearing: hearingDetails
  };
  req.body = {};

  res.render = sinon.stub();
  res.redirect = sinon.stub();

  beforeEach(() => {
    req.session.question = {};
    req.body = {};
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getQuestion', () => {
    let getQuestionService;

    beforeEach(() => {
      getQuestionService = null;
    });

    it('should call render with the template and question header', async() => {
      const questionHeading = 'What is the meaning of life?';
      const questionBody = 'Many people ask this question...';
      const questionAnswer = '';
      const questionAnswerState = 'unanswered';
      const questionAnswerDate = moment().utc().format();
      getQuestionService = () => Promise.resolve({
        question_header_text: questionHeading,
        question_body_text: questionBody,
        answer: questionAnswer,
        answer_state: questionAnswerState,
        answer_date: questionAnswerDate
      });
      await getQuestion(getQuestionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('question/index.html', {
        question: {
          questionId: req.params.questionId,
          header: questionHeading,
          body: questionBody,
          answer: { 
            value: questionAnswer,
            date: questionAnswerDate,
          },
          answer_state: questionAnswerState
        }
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getQuestionService = () => Promise.reject(error);
      await getQuestion(getQuestionService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postAnswer', () => {
    let postAnswerService;

    beforeEach(() => {
      postAnswerService = null;
    });

    afterEach(() => {
      res.redirect.reset();
    });

    it('should call res.redirect when saving an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      postAnswerService = () => Promise.resolve();
      await postAnswer(postAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
    });

    it('should call res.redirect when submitting an answer and there are no errors', async() => {
      req.body['question-field'] = 'My amazing answer';
      req.body.submit = 'submit';
      postAnswerService = () => Promise.resolve();
      await postAnswer(postAnswerService)(req, res, next);
      expect(res.redirect).to.have.been.calledWith(
        `${Paths.question}/${req.params.questionId}/submit`
      );
    });

    it('should call next and appInsights with the error when there is one', async() => {
      req.body['question-field'] = 'My amazing answer';
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      postAnswerService = () => Promise.reject(error);
      await postAnswer(postAnswerService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });

    it('should call res.render with the validation error message', () => {
      req.body['question-field'] = '';
      postAnswer(postAnswerService)(req, res, next);
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
      express.Router.restore();
    });

    it('calls router.get with the path and middleware', () => {
      setupQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith('/:questionId');
    });

    it('calls router.post with the path and middleware', () => {
      setupQuestionController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith('/:questionId');
    });

    it('returns the router', () => {
      const controller = setupQuestionController({ getQuestionService: {} });
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});

export {};