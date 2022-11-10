import { IdamService } from 'app/server/services/idam';
import * as Service2Service from 'app/server/services/s2s';

import {
  getLogout,
  getIdamCallback,
  setupLoginController,
  redirectToLogin,
  redirectToIdam,
} from 'app/server/controllers/login';
import * as AppInsights from 'app/server/app-insights';
import * as express from 'express';
import * as Paths from 'app/server/paths';
import { HearingService } from 'app/server/services/hearing';
const { expect, sinon } = require('test/chai-sinon');
const config = require('config');
const content = require('locale/content');

const idamUrl = config.get('idam.url');

describe('controllers/login', () => {
  let next;
  let req;
  let res;
  const hearingDetails = {
    case_id: 12345,
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith',
  };

  beforeEach(() => {
    req = {
      session: {
        question: {},
        destroy: sinon.stub().yields(),
      },
      body: {
        'email-address': 'test@example.com',
      },
      protocol: 'http',
      hostname: 'localhost',
      query: { redirectUrl: '', tya: 'tya-number' },
      cookies: {},
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
    };
    next = sinon.stub();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackTrace');
    sinon.stub(AppInsights, 'trackEvent');
  });

  afterEach(() => {
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackTrace as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
  });

  describe('#redirectToLogin', () => {
    it('redirect to login page', () => {
      redirectToLogin(req, res);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/sign-in');
    });
  });

  describe('#getLogout', () => {
    it('destroys the session and redirects to login when access token is present', async () => {
      req.session.accessToken = 'accessToken';
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as IdamService;

      await getLogout(idamServiceStub)(req, res);
      expect(idamServiceStub.deleteToken).to.have.been.calledOnce.calledWith(
        req.session.accessToken
      );
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });

    it('does NOT destroy the session but redirects to login when access token is NOT present', async () => {
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as IdamService;

      await getLogout(idamServiceStub)(req, res);

      expect(idamServiceStub.deleteToken).to.have.been.callCount(0);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });
  });

  describe.skip('#getLogout with redirectUrl Parameter', () => {
    it('destroys the session and redirects to custom url with redirectUrl parameter.', async () => {
      req.session.accessToken = 'accessToken';
      req.query.redirectUrl = Paths.taskList;
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as IdamService;

      await getLogout(idamServiceStub)(req, res);
      expect(idamServiceStub.deleteToken).to.have.been.calledOnce.calledWith(
        req.session.accessToken
      );
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });
  });

  describe('#redirectToIdam', () => {
    it('builds correct url', () => {
      const idamServiceStub = {
        getRedirectUrl: sinon
          .stub()
          .withArgs('http', 'localhost')
          .returns('http://redirect_url'),
      } as IdamService;
      redirectToIdam('/idam_path', idamServiceStub)(req, res);

      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${idamUrl}/idam_path?redirect_uri=http%3A%2F%2Fredirect_url&client_id=sscs&response_type=code&state=tya-number`
      );
    });

    it('builds correct sign in url', () => {
      const idamServiceStub = {
        getRedirectUrl: sinon
          .stub()
          .withArgs('http', 'localhost')
          .returns('http://redirect_url'),
      } as IdamService;
      req.query = { redirectUrl: '', state: 'state-value' };

      redirectToIdam('/idam_path', idamServiceStub)(req, res);

      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${idamUrl}/idam_path?redirect_uri=http%3A%2F%2Fredirect_url&client_id=sscs&response_type=code&state=state-value`
      );
    });
  });

  describe('#getIdamCallback', () => {
    describe('called without code', () => {
      it('redirects to idam login', async () => {
        req.query = {};

        const redirectToIdam = sinon.stub();
        await getIdamCallback(redirectToIdam, null, null, null)(req, res, next);

        expect(redirectToIdam).to.have.been.calledOnce.calledWith(req, res);
      });
    });

    const accessToken = 'someAccessToken';

    describe('throw exception because idam 400', () => {
      it('throw error', async () => {
        const error400 = new Error('400 Not Authorised');

        let hearingServiceStub;
        req.query = {
          code: 'badCode',
        };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon.stub().rejects(error400),
        } as IdamService;

        // eslint-disable-next-line prefer-const
        hearingServiceStub = {} as HearingService;

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          null
        )(req, res, next);

        expect(AppInsights.trackEvent).to.have.been.called.calledWith(
          'MYA_IDAM_CODE_AUTH_ERROR'
        );
        expect(AppInsights.trackEvent).to.have.been.called.calledWith(
          'MYA_LOGIN_FAIL'
        );
      });
    });

    describe('throw exception because no caseId', () => {
      it('throw error', async () => {
        sinon.stub(Service2Service, 'generateToken').returns(3);
        const accessToken = 'someAccessToken';
        let hearingServiceStub;
        req.query = {
          code: 'someCode',
        };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        const hearingDetails = [
          {
            online_hearing_id: '1',
            appellant_name: 'John Smith',
          },
        ];
        // eslint-disable-next-line prefer-const
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: hearingDetails }),
        } as HearingService;

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          null
        )(req, res, next);
        const error = new Error(
          'Case ID cannot be empty from hearing in session'
        );
        expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
          sinon.match.has('message', error.message)
        );
        expect(AppInsights.trackEvent).to.have.been.calledTwice;
        expect(AppInsights.trackEvent).calledWith('MYA_LOGIN_FAIL');
        expect(AppInsights.trackEvent).calledWith('MYA_SESSION_READ_FAIL');
        expect(next).to.have.been.calledWith(
          sinon.match.has('message', error.message)
        );
      });
    });

    describe('on success with MYA enabled', () => {
      let hearingServiceStub;
      let trackYourAppealService;
      beforeEach(async () => {
        req.query = { code: 'someCode', state: 'tya-number' };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [hearingDetails] }),
        } as HearingService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', () => {
        expect(
          hearingServiceStub.getOnlineHearingsForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('logs AppInsights trace log', () => {
        expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
          `[12345] - User logged in successfully as someEmail@example.com`
        );
      });

      it('publishes AppInsights event', () => {
        expect(AppInsights.trackEvent).to.have.been.calledOnce.calledWith(
          `MYA_LOGIN_SUCCESS`
        );
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.status);
      });
    });

    describe('check hideHearing flag with MYA enabled', () => {
      let hearingServiceStub;
      let trackYourAppealService;
      let redirectToIdam;
      let idamServiceStub;
      beforeEach(async () => {
        req.query = { code: 'someCode', state: 'tya-number' };
        redirectToIdam = sinon.stub();
        idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [hearingDetails] }),
        } as HearingService;
      });

      it('sets the hideHearing false', async () => {
        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };
        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.hideHearing).to.be.eql(false);
      });

      it('sets the hideHearing true', async () => {
        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: { hideHearing: true } }),
        };
        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.hideHearing).to.be.eql(true);
      });
    });

    describe('cannot find case with MYA enabled', () => {
      let hearingServiceStub;
      let trackYourAppealService;
      beforeEach(async () => {
        req.query = { code: 'someCode', state: 'tya-number' };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [] }),
        } as HearingService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', () => {
        expect(
          hearingServiceStub.getOnlineHearingsForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('redirects to assign case page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.assignCase);
      });
    });

    describe('finds multiple cases with MYA enabled', () => {
      let hearingServiceStub;
      let trackYourAppealService;
      beforeEach(async () => {
        req.query = { code: 'someCode', state: 'tya-number' };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon.stub().resolves({
            statusCode: 200,
            body: [hearingDetails, hearingDetails],
          }),
        } as HearingService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', () => {
        expect(
          hearingServiceStub.getOnlineHearingsForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('loads select case page', () => {
        expect(res.render).to.have.been.calledWith('select-case.njk', {
          hearingsByName: {
            'John Smith': [
              {
                appellant_name: 'John Smith',
                case_id: 12345,
                case_reference: '12345',
                online_hearing_id: '1',
              },
              {
                appellant_name: 'John Smith',
                case_id: 12345,
                case_reference: '12345',
                online_hearing_id: '1',
              },
            ],
          },
        });
      });
    });

    describe('selects a case by case id with MYA enabled', () => {
      let hearingServiceStub;
      let trackYourAppealService;
      beforeEach(async () => {
        req.query = { code: 'someCode', state: 'tya-number', caseId: '11111' };
        const redirectToIdam = sinon.stub();
        const idamServiceStub = {
          getToken: sinon
            .stub()
            .withArgs('someCode', 'http', 'localhost')
            .resolves({ access_token: accessToken }),
          getUserDetails: sinon
            .stub()
            .withArgs(accessToken)
            .resolves({ email: 'someEmail@example.com' }),
        } as IdamService;
        hearingServiceStub = {
          getOnlineHearingsForCitizen: sinon.stub().resolves({
            statusCode: 200,
            body: [
              {
                case_id: 11111,
                online_hearing_id: '1',
                case_reference: '11111',
                appellant_name: 'John Smith',
              },
              {
                case_id: 22222,
                online_hearing_id: '2',
                case_reference: '22222',
                appellant_name: 'John Smith',
              },
            ],
          }),
        } as HearingService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          hearingServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', () => {
        expect(
          hearingServiceStub.getOnlineHearingsForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('sets the hearing', () => {
        expect(req.session.hearing).to.be.eql({
          case_id: 11111,
          online_hearing_id: '1',
          case_reference: '11111',
          appellant_name: 'John Smith',
        });
      });

      it('redirects to task list page', () => {
        expect(res.redirect).to.have.been.calledWith(Paths.status);
      });
    });
  });
});

describe('#setupLoginController', () => {
  const deps = {};

  beforeEach(() => {
    sinon.stub(express, 'Router').returns({
      get: sinon.stub(),
      post: sinon.stub(),
    });
  });

  afterEach(() => {
    (express.Router as sinon.SinonStub).restore();
  });

  it('sets up GET login', () => {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.login);
  });

  it('sets up GET logout', () => {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.logout);
  });

  it('sets up GET register', () => {
    setupLoginController(deps);
    expect(express.Router().get).to.have.been.calledWith(Paths.register);
  });

  it('returns the router', () => {
    const controller = setupLoginController(deps);
    expect(controller).to.equal(express.Router());
  });
});
