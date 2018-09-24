const { expect, sinon } = require('test/chai-sinon');
import { setupExtendDeadlineController, getIndex, extensionConfirmation } from 'app/server/controllers/extend-deadline.ts';
const { INTERNAL_SERVER_ERROR } = require('http-status-codes');
import * as AppInsights from 'app/server/app-insights';
import * as  express from 'express';
import * as Paths from 'app/server/paths';
import * as moment from 'moment'; 
import { ensureAuthenticated } from 'app/server/middleware/ensure-authenticated';

describe('controllers/extend-deadline.js', () => {
  const next = sinon.stub();
  const req: any = {
    body: {},
    session: {
      hearing: {
        online_hearing_id: '1234'
      }
    }
  }
  const res: any = {};

  res.render = sinon.stub();

  beforeEach(() => {
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('getIndex', () => {
    it('should call render with the template', async() => {
      getIndex(req, res);
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {});
    });
  });

  describe('postExtension', () => {

    let questions;  
    let getAllQuestionsService;
    let extendDeadlineService;

    beforeEach(() => {
      getAllQuestionsService = null;
      extendDeadlineService = null;
      questions = [
        {
          question_id: '001',
          question_header_text: 'How do you interact with people?',
          answer_state: 'draft'
        }
      ];
    });

    it('should show extension confirmation when submitting yes', async() => {
      req.body['extend-deadline'] = 'yes';
      const deadline_expiry_date = moment().utc().add(7, 'day').format()
      
      getAllQuestionsService = () => Promise.resolve({ questions, deadline_expiry_date });
      extendDeadlineService = () => Promise.resolve({ questions, deadline_expiry_date });

      await extensionConfirmation(getAllQuestionsService, extendDeadlineService)(req, res, next);      
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        deadline: deadline_expiry_date,
        extend: 'yes'
      });
    });

    it('should show extension confirmation when submitting no', async() => {
      req.body['extend-deadline'] = 'no';
      const deadline_expiry_date = moment().utc().format()
      
      getAllQuestionsService = () => Promise.resolve({ questions, deadline_expiry_date });
      extendDeadlineService = () => Promise.resolve({ questions, deadline_expiry_date });

      await extensionConfirmation(getAllQuestionsService, extendDeadlineService)(req, res, next);   
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        deadline: deadline_expiry_date,
        extend: 'no'
      });
    });

    it('should show error when submitting empty form', async() => {
      req.body = {};
      await extensionConfirmation(getAllQuestionsService, extendDeadlineService)(req, res, next);   
      expect(res.render).to.have.been.calledWith('extend-deadline/index.html', {
        error: true
      });
    });


    it('should call next and appInsights with the error when there is one', async() => {
      req.body['extend-deadline'] = 'yes';

      const error = { value: INTERNAL_SERVER_ERROR, reason: 'Server Error' };
      getAllQuestionsService = () => Promise.reject(error);
      extendDeadlineService = () => Promise.reject(error);

      await extensionConfirmation(getAllQuestionsService, extendDeadlineService)(req, res, next);   
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('setupExtendDeadlineController', () => {
    const deps = {
      ensureAuthenticated
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
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(`${Paths.extendDeadline}`, ensureAuthenticated);
    });

    it('calls router.post with the path and middleware', () => {
      setupExtendDeadlineController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(`${Paths.extendDeadline}`, ensureAuthenticated);
    });

    it('returns the router', () => {
      const controller = setupExtendDeadlineController({ });
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});

export {};