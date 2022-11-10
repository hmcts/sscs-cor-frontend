import * as hearing from '../../../app/server/controllers/hearing';

import {
  setupTaskListController,
  getCoversheet,
  getEvidencePost,
  getTaskList,
} from 'app/server/controllers/task-list';

import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
import { Feature, isFeatureEnabled } from 'app/server/utils/featureEnabled';
import { NextFunction } from 'express';
import { expect, sinon } from '../../chai-sinon';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import moment from 'moment';

describe('controllers/task-list', () => {
  let req;
  let res;
  let next: NextFunction;
  let additionalEvidenceService;
  let sandbox: sinon.SinonSandbox;
  const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith',
    case_id: 12345,
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        hearing: hearingDetails,
        appeal: {},
      },
      cookies: {},
    };
    req.cookies[Feature.POST_BULK_SCAN] = 'false';
    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      header: sandbox.stub(),
    };
    next = sandbox.stub().resolves();
    sandbox.stub(AppInsights, 'trackException');
    sandbox.stub(AppInsights, 'trackEvent');
    additionalEvidenceService = {
      getCoversheet: sandbox.stub().resolves('file'),
    };
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
    sandbox.restore();
  });

  describe.skip('getCoversheet', () => {
    it('should return a pdf file', async () => {
      await getCoversheet(additionalEvidenceService)(req, res, next);
      expect(res.send).to.have.been.calledOnce.calledWith(
        new Buffer('file', 'binary')
      );
    });

    it('should track Exception with AppInsights and call next(error)', async () => {
      additionalEvidenceService = {
        getCoversheet: sandbox.stub().rejects(error),
      };
      await getCoversheet(additionalEvidenceService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
      expect(next).to.have.been.calledWith(error);
    });

    it('should throw error and event if no sessions', async () => {
      req.session = null;

      expect(
        await getCoversheet(additionalEvidenceService)(req, res, next)
      ).to.throw(TypeError);

      const error = new Error('Unable to retrieve session from session store');
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        sinon.match.has('message', error.message)
      );
      expect(AppInsights.trackEvent).to.have.been.calledTwice;
    });
  });

  describe('getTaskList', () => {
    it('should render task-list.njk page', () => {
      req.session.appeal = {
        hearingType: null,
      };
      getTaskList(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith('task-list.njk', {
        deadlineExpiryDate: null,
        hearingType: null,
        appeal: req.session.appeal,
      });
    });
  });

  describe('getEvidencePost', () => {
    it('should render post-evidence.njk page', () => {
      getEvidencePost(req, res, next);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'post-evidence.njk',
        { postBulkScan: false }
      );
    });
  });

  describe('setupTaskListController', () => {
    const deps = {
      getAllQuestionsService: {},
    };

    beforeEach(() => {
      sinon.stub(express, 'Router').returns({
        get: sinon.stub(),
        post: sinon.stub(),
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
});

export {};
