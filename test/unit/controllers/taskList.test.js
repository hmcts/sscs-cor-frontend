const { expect, sinon } = require('test/chai-sinon');
const { setupTaskListController, getTaskList } = require('app/controllers/taskList');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app-insights');
const express = require('express');

describe('controllers/taskList.js', () => {
  const next = sinon.stub();
  const req = {}, res = {};

  req.params = {
    hearingId: '1'
  };

  res.render = sinon.stub();

  beforeEach(() => {
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  describe('getTaskList', () => {
    // eslint-disable-next-line init-declarations
    let getAllQuestionsService;

    beforeEach(() => {
      getAllQuestionsService = null;
    });

    it('should call render with the template and the list of questions', async() => {
      const questions = [
        {
          question_id: '001',
          question_header_text: 'How do you interact with people?',
          answer_state: 'draft'
        }
      ];
      getAllQuestionsService = () => Promise.resolve({ questions });
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        hearingId: req.params.hearingId,
        questions
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getAllQuestionsService = () => Promise.reject(error);
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(appInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('setupTaskListController', () => {
    const deps = {
      getAllQuestionsService: {}
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
      setupTaskListController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith('/:hearingId');
    });

    it('returns the router', () => {
      const controller = setupTaskListController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
