const { expect, sinon } = require('test/chai-sinon');
import { setupExtendDeadlineController, getIndex, extensionConfirmation } from 'app/server/controllers/extend-deadline';
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
import * as moment from 'moment';
import { ensureAuthenticated } from 'app/server/middleware/ensure-authenticated';
import { checkDecision } from 'app/server/middleware/check-decision';

describe('controllers/extend-deadline', () => {
  const next = sinon.stub();
  const deadline = moment.utc().add(7, 'day').format();
  const extendDeadline = moment.utc().add(14, 'day').format();
  const req: any = {
    body: {},
    session: {
      hearing: {
        online_hearing_id: '1234',
        deadline: deadline,
        extensionCount: 0
      }
    }
  };

  const res: any = {};

  res.render = sinon.stub();

  beforeEach(() => {
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getIndex', () => {
    it('should call render with the template', async () => {
      getIndex(req, res);
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        hearing: req.session.hearing
      });
    });
  });

  describe('postExtension', () => {

    let questions;
    let hearingService;

    beforeEach(() => {
      hearingService = {
        extendDeadline: sinon.stub()
      };
    });

    it('should show extension confirmation when submitting no', async () => {
      req.body['extend-deadline'] = 'no';

      await extensionConfirmation(hearingService)(req, res, next);
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        deadline: deadline,
        extend: 'no'
      });
    });

    it('should show extension confirmation when submitting yes', async () => {
      req.body['extend-deadline'] = 'yes';

      hearingService.extendDeadline.resolves({ deadline_expiry_date: extendDeadline });

      await extensionConfirmation(hearingService)(req, res, next);
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        deadline: extendDeadline,
        extend: 'yes'
      });
      expect(req.session.hearing.deadline).to.equal(extendDeadline);
    });

    it('should show error when submitting empty form', async () => {
      req.body = {};
      await extensionConfirmation(hearingService)(req, res, next);
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        error: true
      });
    });

    it('should call next and appInsights with the error when there is one', async () => {
      req.body['extend-deadline'] = 'yes';

      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      hearingService.extendDeadline.rejects(error);

      await extensionConfirmation(hearingService)(req, res, next);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('setupExtendDeadlineController', () => {
    const deps = {
      prereqMiddleware: [ensureAuthenticated, checkDecision]
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
      setupExtendDeadlineController(deps);
      expect(express.Router().get).to.have.been.calledWith(`${Paths.extendDeadline}`, deps.prereqMiddleware);
    });

    it('calls router.post with the path and middleware', () => {
      setupExtendDeadlineController(deps);
      expect(express.Router().post).to.have.been.calledWith(`${Paths.extendDeadline}`, deps.prereqMiddleware);
    });

    it('returns the router', () => {
      const controller = setupExtendDeadlineController({});
      expect(controller).to.equal(express.Router());
    });
  });
});
