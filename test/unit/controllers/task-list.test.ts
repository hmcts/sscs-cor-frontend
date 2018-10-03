const { expect, sinon } = require('test/chai-sinon');
import { setupTaskListController, getTaskList, processDeadline } from 'app/server/controllers/task-list.ts';
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const moment = require('moment');
import * as AppInsights from 'app/server/app-insights';
const express = require('express');
import * as Paths from 'app/server/paths';

/* eslint-disable no-magic-numbers */
describe('controllers/task-list.js', () => {
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
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getTaskList', () => {
    let getAllQuestionsService;
    let questions;
    const deadline = moment().utc().add(7, 'days');
    const inputDeadline = deadline.format();
    const expectedDeadline = deadline.format();

    beforeEach(() => {
      getAllQuestionsService = {};
      questions = [
        {
          question_id: '001',
          question_header_text: 'How do you interact with people?',
          answer_state: 'draft'
        }
      ];
    });

    it('should call render with the template and the list of questions and deadline details', async() => {
      getAllQuestionsService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputDeadline });
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: true,
          expiryDate: expectedDeadline,
          status: 'pending'
        }
      });
    });

    it('should call render with deadline status complete when all questions submitted', async() => {
      questions[0].answer_state = 'submitted';
      getAllQuestionsService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputDeadline });
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: false,
          expiryDate: null,
          status: 'completed'
        }
      });
    });

    it('should call render with deadline status expired when deadline is expired', async() => {
      const expiredDeadline = moment().utc().subtract(1, 'day');
      const inputExpiredDeadline = expiredDeadline.format();
      const expectedExpiredDeadline = expiredDeadline.format();
      getAllQuestionsService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputExpiredDeadline });
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: true,
          expiryDate: expectedExpiredDeadline,
          status: 'expired'
        }
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getAllQuestionsService.getAllQuestions = () => Promise.reject(error);
      await getTaskList(getAllQuestionsService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
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
      expect(express.Router().get).to.have.been.calledWith(Paths.taskList);
    });

    it('returns the router', () => {
      const controller = setupTaskListController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });

  describe('processDeadline', () => {
    it('deadline is completed status if all questions submitted', () => {
      const deadline = moment().utc().format();
      const deadlineDetails = processDeadline(deadline, true);
      expect(deadlineDetails).to.deep.equal({
        extendable: false,
        expiryDate: null,
        status: 'completed'
      });
    });

    it('deadline is pending if expiry is in the future', () => {
      const deadline = moment().utc().add(7, 'days');
      const inputDeadlineFormatted = deadline.format();
      const expectedFormat = deadline.format();

      const deadlineDetails = processDeadline(inputDeadlineFormatted, false);
      expect(deadlineDetails).to.deep.equal({
        extendable: true,
        expiryDate: expectedFormat,
        status: 'pending'
      });
    });

    it('deadline is expired if expiry is in the past', () => {
      const deadline = moment().utc().subtract(1, 'day');
      const inputDeadlineFormatted = deadline.format();
      const expectedFormat = deadline.format();

      const deadlineDetails = processDeadline(inputDeadlineFormatted, false);
      expect(deadlineDetails).to.deep.equal({
        extendable: true,
        expiryDate: expectedFormat,
        status: 'expired'
      });
    });
  });
});

export {};
