const {expect, sinon} = require('test/chai-sinon');
const {getLogin, getLogout, getIdamCallback, setupLoginController} = require('app/server/controllers/login.ts');
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

  describe('#getLogin', () => {
    it('redirect to idam login page', () => {
      getLogin(() => "http://localhost/redirect_url", "/someIdamPath")(req, res);

      expect(res.redirect).to.have.been.calledOnce.calledWith('http://localhost:8082/someIdamPath?redirect_uri=http%3A%2F%2Flocalhost%2Fredirect_url&client_id=sscs-cor&response_type=code');
    });
  });

  describe('#getLogout', () => {
    it('destroys the session and redirects to login', () => {
      getLogout(req, res);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });
  });

  describe('#getIdamCallback', () => {
    let getOnlineHearing;

    describe('called without code', () => {
      it('redirects to idam login', () => {
        req.query = {};
        getIdamCallback(null, null, null, () => "http://localhost/redirect_url")(req, res, next);

        expect(res.redirect).to.have.been.calledOnce.calledWith('http://localhost:8082/login?redirect_uri=http%3A%2F%2Flocalhost%2Fredirect_url&client_id=sscs-cor&response_type=code');
      });
    });

    describe('on success', () => {
      beforeEach(async () => {
        req.query = {'code': 'someCode'};

        const getToken = sinon.stub();
        getToken.withArgs('someCode', 'http', 'localhost').resolves({'access_token': 'someAccessToken'});
        const getUserDetails = sinon.stub();
        getUserDetails.withArgs('someAccessToken').resolves({'email': 'someEmail@example.com'});
        getOnlineHearing = sinon.stub().resolves({body: hearingDetails});

        await getIdamCallback(getToken, getUserDetails, getOnlineHearing, () => "http://localhost/redirect_url")(req, res, next);
      });

      it('calls the online hearing service', () => {
        expect(getOnlineHearing).to.have.been.calledOnce.calledWith('someEmail@example.com');
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.taskList);
      });
    });

    describe('after decision issued', () => {
      beforeEach(async () => {
        req.query = {'code': 'someCode'};

        const getToken = sinon.stub();
        getToken.withArgs('someCode', 'http', 'localhost').resolves({'access_token': 'someAccessToken'});
        const getUserDetails = sinon.stub();
        getUserDetails.withArgs('someAccessToken').resolves({'email': 'someEmail@example.com'});
        const hearingWithDecision = {
          ...hearingDetails,
          decision: {
            decision_award: 'FINAL',
            decision_header: 'Decision header',
            decision_reason: 'Decision reason',
            decision_text: 'Decision test',
            decision_state: 'decision_issued',
          }
        };
        getOnlineHearing = sinon.stub().resolves({body: hearingWithDecision});

        await getIdamCallback(getToken, getUserDetails, getOnlineHearing, () => "http://localhost/redirect_url")(req, res, next);
      });

      it('redirects to decision page if issued decision exists', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.decision);
      });
    });
  });

  describe('on error', () => {
    const error = new Error('getOnlineHearingService error');

    beforeEach(async () => {
      req.query = {'code': 'someCode'};
      const getOnlineHearing = sinon.stub().rejects(error);
      const getToken = sinon.stub();
      getToken.withArgs('someCode', 'http', 'localhost').resolves({'access_token': 'someAccessToken'});
      const getUserDetails = sinon.stub();
      getUserDetails.withArgs('someAccessToken').resolves({'email': 'someEmail@example.com'});
      await getIdamCallback(getToken, getUserDetails, getOnlineHearing, () => "http://localhost/redirect_url")(req, res, next);
    });

    afterEach(() => {
      (express.Router as sinon.SinonStub).restore();
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

  it('sets up GET idam callback', () => {
    setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(express.Router().get).to.have.been.calledWith(Paths.idamCallback);
  });

  it('returns the router', () => {
    const controller = setupLoginController(deps);
    // eslint-disable-next-line new-cap
    expect(controller).to.equal(express.Router());
  });
});

export {};