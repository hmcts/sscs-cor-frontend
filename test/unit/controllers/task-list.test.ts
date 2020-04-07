const { expect, sinon } = require('test/chai-sinon');
import {
  setupTaskListController,
  getCoversheet,
  getEvidencePost,
  getTaskList,
  processDeadline
} from 'app/server/controllers/task-list';
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
const moment = require('moment');
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
import { Feature, isFeatureEnabled } from 'app/server/utils/featureEnabled';

describe.skip('controllers/task-list', () => {
  let req;
  let res;
  let next;
  let additionalEvidenceService;
  let sandbox: sinon.SinonSandbox;
  const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith',
    case_id: 12345
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    req = {
      session: {
        hearing: hearingDetails
      },
      cookies: {}
    };
    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      header: sandbox.stub()
    };
    next = sandbox.stub();
    sandbox.stub(AppInsights, 'trackException');
    additionalEvidenceService = {
      getCoversheet: sandbox.stub().resolves('file')
    };
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
    sandbox.restore();
  });

  describe('getCoversheet', () => {
    it('should return a pdf file', async () => {
      await getCoversheet(additionalEvidenceService)(req, res, next);
      expect(res.send).to.have.been.calledOnce.calledWith(new Buffer('file', 'binary'));
    });

    it('should track Exception with AppInsights and call next(error)', async () => {
      additionalEvidenceService = {
        getCoversheet: sandbox.stub().rejects(error)
      };
      await getCoversheet(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getEvidencePost', () => {
    it('should render post-evidence.html page', () => {
      getEvidencePost(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith('post-evidence.html', { postBulkScan: false });
    });
  });

  describe('getTaskList', () => {
    let questionService;
    let questions;
    const deadline = moment.utc().add(7, 'days');
    const inputDeadline = deadline.format();
    const expectedDeadline = deadline.format();

    beforeEach(() => {
      req.cookies[Feature.MANAGE_YOUR_APPEAL] = 'false';
      questionService = {};
      questions = [
        {
          question_id: '001',
          question_header_text: 'How do you interact with people?',
          answer_state: 'draft'
        }
      ];
    });

    it('should call render with the template and the empty list of questions', async() => {
      questionService.getAllQuestions = () => Promise.resolve({ });
      await getTaskList(questionService)(req, res, next);
      expect(res.render).to.have.been.called.calledWith('task-list.html', {
        deadlineExpiryDate: null,
        questions: [],
        hearingType: 'cor'
      });
    });

    it('should call render with the template and the list of questions and deadline details', async() => {
      questionService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputDeadline });
      await getTaskList(questionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: true,
          expiryDate: expectedDeadline,
          status: 'pending'
        },
        hearingType: 'cor'
      });
    });

    it('should call render with deadline status complete when all questions submitted', async() => {
      questions[0].answer_state = 'submitted';
      questionService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputDeadline });
      await getTaskList(questionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: false,
          expiryDate: null,
          status: 'completed'
        },
        hearingType: 'cor'
      });
    });

    it('should call render with deadline status expired when deadline is expired', async() => {
      const expiredDeadline = moment.utc().subtract(1, 'day');
      const inputExpiredDeadline = expiredDeadline.format();
      const expectedExpiredDeadline = expiredDeadline.format();
      questionService.getAllQuestions = () => Promise.resolve({ questions, deadline_expiry_date: inputExpiredDeadline });
      await getTaskList(questionService)(req, res, next);
      expect(res.render).to.have.been.calledWith('task-list.html', {
        questions,
        deadlineExpiryDate: {
          extendable: true,
          expiryDate: expectedExpiredDeadline,
          status: 'expired'
        },
        hearingType: 'cor'
      });
    });

    it('should call next and appInsights with the error when there is one', async() => {
      questionService.getAllQuestions = () => Promise.reject(error);
      await getTaskList(questionService)(req, res, next);
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
      (express.Router as sinon.SinonStub).restore();
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
      const deadline = moment.utc().format();
      const deadlineDetails = processDeadline(deadline, true);
      expect(deadlineDetails).to.deep.equal({
        extendable: false,
        expiryDate: null,
        status: 'completed'
      });
    });

    it('deadline is pending if expiry is in the future', () => {
      const deadline = moment.utc().add(7, 'days');
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
      const deadline = moment.utc().subtract(1, 'day');
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
