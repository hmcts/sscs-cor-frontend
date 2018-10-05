const {expect, sinon} = require('test/chai-sinon');
import {getLogout, getIdamCallback, setupLoginController, redirectToLogin, redirectToIdam, getDummyLogin, postDummyLogin} from 'app/server/controllers/login.ts';
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';

describe('controllers/login.ts', () => {
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
      },
      protocol: 'http',
      hostname: 'localhost'
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

  describe('#redirectToLogin', () => {
    it('redirect to login page', () => {
      redirectToLogin(req, res);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/sign-in');
    });
  });

  describe('#getLogout', () => {
    it('destroys the session and redirects to login', () => {
      getLogout(req, res);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });
  });

  describe('#redirectToIdam', () => {
    it('builds correct url', () => {
      const getRedirectUrl = sinon.stub();
      getRedirectUrl.withArgs('http', 'localhost').returns("http://redirect_url");
      redirectToIdam("idam_path", getRedirectUrl)(req, res);

      expect(res.redirect).to.have.been.calledOnce.calledWith("http://localhost:8082/idam_path?redirect_uri=http%3A%2F%2Fredirect_url&client_id=sscs-cor&response_type=code");
    })
  });

  describe('#getIdamCallback', () => {
    let getOnlineHearing;

    describe('called without code', () => {
      it('redirects to idam login', () => {
        req.query = {};

        const redirectToIdam = sinon.stub();
        getIdamCallback(redirectToIdam, null, null, null)(req, res, next);

        expect(redirectToIdam).to.have.been.calledOnce.calledWith(req, res);
      });
    });

    describe('on success', () => {
      beforeEach(async () => {
        req.query = {'code': 'someCode'};

        const redirectToIdam = sinon.stub();
        const getToken = sinon.stub();
        getToken.withArgs('someCode', 'http', 'localhost').resolves({'access_token': 'someAccessToken'});
        const getUserDetails = sinon.stub();
        getUserDetails.withArgs('someAccessToken').resolves({'email': 'someEmail@example.com'});
        getOnlineHearing = sinon.stub().resolves({body: hearingDetails});

        await getIdamCallback(redirectToIdam, getToken, getUserDetails, getOnlineHearing)(req, res, next);
      });

      it('calls the online hearing service', () => {
        expect(getOnlineHearing).to.have.been.calledOnce.calledWith('someEmail@example.com');
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.taskList);
      });
    });
  });

  describe('on error', () => {
    const error = new Error('getOnlineHearingService error');

    beforeEach(async () => {
      req.query = {'code': 'someCode'};

      const redirectToIdam = sinon.stub();
      const getOnlineHearing = sinon.stub().rejects(error);
      const getToken = sinon.stub();
      getToken.withArgs('someCode', 'http', 'localhost').resolves({'access_token': 'someAccessToken'});
      const getUserDetails = sinon.stub();
      getUserDetails.withArgs('someAccessToken').resolves({'email': 'someEmail@example.com'});
      await getIdamCallback(redirectToIdam, getToken, getUserDetails, getOnlineHearing)(req, res, next);
    });

    it('tracks the exception', () => {
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(error);
    });
    it('calls next with the error', () => {
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('#getDummyLogin', () => {
    it('load dummy login page', () => {
      getDummyLogin(req, res);

      expect(res.render).to.have.been.calledOnce.calledWith('dummy-login.html');
    });
  });

  describe('#postDummyLogin', () => {
    let getOnlineHearing;
    beforeEach(async () => {
      const email = "someEmail@example.com";
      req.body['username'] = email;
      getOnlineHearing = sinon.stub().resolves({body: hearingDetails});
      await postDummyLogin(getOnlineHearing)(req, res, next);
    });

    it('calls the online hearing service', () => {
      expect(getOnlineHearing).to.have.been.calledOnce.calledWith('someEmail@example.com');
    });

    it('redirects to task list page', () => {
      expect(res.redirect).to.have.been.calledWith(Paths.taskList);
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
    (express.Router as sinon.SinonStub).restore();
  });

  it('sets up GET login', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().get).to.have.been.calledWith(Paths.login);
  });

  it('sets up GET logout', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().get).to.have.been.calledWith(Paths.logout);
  });

  it('sets up GET register', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().get).to.have.been.calledWith(Paths.register);
  });

  it('returns the router', () => {
    const controller = setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(controller).to.equal(express.Router());
  });

  it('does not setup GET dummy login', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().get).not.to.have.been.calledWith(Paths.dummyLogin);
  });

  it('does not setup POST dummy login', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().post).not.to.have.been.calledWith(Paths.dummyLogin);
  });
});