const { expect, sinon } = require('test/chai-sinon');
const { getLogin, getLogout, postLogin, setupLoginController } = require('app/server/controllers/login.ts');
import * as AppInsights from 'app/server/app-insights';
const express = require('express');
import * as Paths from 'app/server/paths';

import * as  validation from 'app/server/utils/fieldValidation';

describe('controllers/login.js', () => {
  let next;
  let req;
  let res;
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: 'SC/123/456',
    appellant_name: 'John Smith'
  };

  beforeEach(() => {
    req = {
      session: {
        question: {},
        destroy: sinon.stub().yields()
      },
      body: {
        'email-address': 'test@example.com'
      }
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub()
    };
    next = sinon.stub();
    sinon.stub(AppInsights, 'trackException');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
  });

  describe('#getLogin', () => {
    it('renders the template', () => {
      getLogin(req, res);
      expect(res.render).to.have.been.calledWith('login.html');
    });
  });

  describe('#getLogout', () => {
    it('destroys the session and redirects to login', () => {
      getLogout(req, res);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });
  });

  describe('#postLogin', () => {
    let getOnlineHearingService;
    const validationError = 'email error';

    describe('on validation', () => {
      beforeEach(async() => {
        sinon.stub(validation, 'loginEmailAddressValidation').returns(validationError)

        getOnlineHearingService = sinon.stub().resolves(hearingDetails);
        await postLogin(getOnlineHearingService)(req, res, next);
      });

      it('renders an error if validation fails', () => {
        expect(res.render).to.have.been.calledOnce.calledWith('login.html', {
          emailAddress: {
            error: validationError,
            value: req.body['email-address']
          }
        });
      });

      afterEach(() => {
        (validation.loginEmailAddressValidation as sinon.SinonStub).restore();
      });      
    });

    describe('on success', () => {
      beforeEach(async() => {
        getOnlineHearingService = sinon.stub().resolves(hearingDetails);
        await postLogin(getOnlineHearingService)(req, res, next);
      });

      it('calls the online hearing service', () => {
        expect(getOnlineHearingService).to.have.been.calledOnce.calledWith(req.body['email-address']);
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.taskList);
      });
    });

    describe('on error', () => {
      const error = new Error('getOnlineHearingService error');

      beforeEach(async() => {
        getOnlineHearingService = sinon.stub().rejects(error);
        await postLogin(getOnlineHearingService)(req, res, next);
      });

      it('tracks the exception', () => {
        expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
      });
      it('calls next with the error', () => {
        expect(next).to.have.been.calledWith(error);
      });
    });
  });

  describe('#setupLoginController', () => {
    const deps = {
      getOnlineHearingService: {}
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

    it('sets up GET', () => {
      setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().get).to.have.been.calledWith(Paths.login);
    });

    it('sets up POST', () => {
      setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(express.Router().post).to.have.been.calledWith(Paths.login);
    });

    it('returns the router', () => {
      const controller = setupLoginController(deps);
      // eslint-disable-next-line new-cap
      expect(controller).to.equal(express.Router());
    });
  });
});

export {};