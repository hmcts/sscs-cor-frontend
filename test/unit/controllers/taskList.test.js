const { expect, sinon } = require('test/chai-sinon');
const { setupTaskListController, getTaskList } = require('app/controllers/taskList');
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const appInsights = require('app-insights');
const express = require('express');
const paths = require('paths');

describe('controllers/taskList.js', () => {
  let req;
  let res;
  let next;
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };

  beforeEach(() => {
    req = {
      session: {
        hearing: hearingDetails
      }
    };
    res = {
      render: sinon.stub()
    };
    next = sinon.stub();
    sinon.stub(appInsights, 'trackException');
  });

  afterEach(() => {
    appInsights.trackException.restore();
  });

  describe('getTaskList', () => {
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
      expect(res.render).to.have.been.calledWith('task-list.html', { questions });
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
      expect(express.Router().get).to.have.been.calledWith(paths.taskList);
    });

    it('returns the router', () => {
      const controller = setupTaskListController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});
