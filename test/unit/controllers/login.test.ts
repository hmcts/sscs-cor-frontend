import { IdamService } from 'app/server/services/idam';
import * as Service2Service from 'app/server/services/s2s';
import * as featureEnabled from 'app/server/utils/featureEnabled';
import config from 'config';
import {
  getLogout,
  getIdamCallback,
  redirectToLogin,
  redirectToIdam,
} from 'app/server/controllers/login';
import * as AppInsights from 'app/server/app-insights';
import * as Paths from 'app/server/paths';
import { CaseService } from 'app/server/services/cases';
import { NextFunction } from 'express';
import { CaseDetails } from 'app/server/models/express-session';
import { expect, sinon } from 'test/chai-sinon';

const idamUrl: string = config.get('idam.url');

describe('controllers/login', function () {
  let req;
  let res;
  let next: NextFunction;
  let isFeatureEnabledStub: sinon.SinonStub;
  const caseDetails: CaseDetails = {
    case_id: 12345,
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith',
  };
  const error = new Error('Error destroying session ');

  beforeEach(function () {
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
    next = sinon.stub().resolves();
    sinon.stub(AppInsights, 'trackException');
    sinon.stub(AppInsights, 'trackTrace');
    sinon.stub(AppInsights, 'trackEvent');
    isFeatureEnabledStub = sinon.stub(featureEnabled, 'isFeatureEnabled');
  });

  afterEach(function () {
    (AppInsights.trackException as sinon.SinonStub).restore();
    (AppInsights.trackTrace as sinon.SinonStub).restore();
    (AppInsights.trackEvent as sinon.SinonStub).restore();
    isFeatureEnabledStub.restore();
  });

  describe('#redirectToLogin', function () {
    it('redirect to login page', function () {
      redirectToLogin(req, res);
      expect(res.redirect).to.have.been.calledOnce.calledWith('/sign-in');
    });
  });

  describe('#getLogout', function () {
    it('destroys the session and redirects to login when access token is present', async function () {
      req.session.accessToken = 'accessToken';
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as Partial<IdamService> as IdamService;

      await getLogout(idamServiceStub)(req, res);
      expect(idamServiceStub.deleteToken).to.have.been.calledOnce.calledWith(
        req.session.accessToken
      );
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });

    it('does NOT destroy the session but redirects to login when access token is NOT present', async function () {
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as Partial<IdamService> as IdamService;

      await getLogout(idamServiceStub)(req, res);

      expect(idamServiceStub.deleteToken).to.have.been.callCount(0);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });

    it('throws an error when deleting a token', async function () {
      req.session.accessToken = 'accessToken';
      const error = new Error('error deleting the token');
      const idamServiceStub = {
        deleteToken: sinon.stub().throws(error),
      } as Partial<IdamService> as IdamService;

      await getLogout(idamServiceStub)(req, res);

      expect(idamServiceStub.deleteToken).to.have.been.callCount(1);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );
    });

    it('throws an error when destroying the session', async function () {
      req.session.destroy.yields(error);
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as Partial<IdamService> as IdamService;

      await getLogout(idamServiceStub)(req, res);
      expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
        error
      );

      expect(idamServiceStub.deleteToken).to.have.been.callCount(0);
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
    });

    it('destroys the session and redirects to custom url with redirectUrl parameter.', async function () {
      req.session.accessToken = 'accessToken';
      req.query.redirectUrl = Paths.taskList;
      const idamServiceStub = {
        deleteToken: sinon
          .stub()
          .withArgs(req.session.accessToken)
          .resolves({}),
      } as Partial<IdamService> as IdamService;

      await getLogout(idamServiceStub)(req, res);
      expect(idamServiceStub.deleteToken).to.have.been.calledOnce.calledWith(
        req.session.accessToken
      );
      expect(req.session.destroy).to.have.been.calledOnce.calledWith();
      expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
    });
  });

  describe('#redirectToIdam', function () {
    let idamServiceStub;

    beforeEach(function () {
      idamServiceStub = {
        // eslint-disable-next-line mocha/no-setup-in-describe
        getRedirectUrl: sinon
          .stub()
          .withArgs('http', 'localhost')
          .returns('http://redirect_url'),
      } as Partial<IdamService> as IdamService;
    });

    it('builds correct url', function () {
      redirectToIdam('/idam_path', idamServiceStub)(req, res);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${idamUrl}/idam_path?redirect_uri=http%3A%2F%2Fredirect_url&client_id=sscs&response_type=code&state=tya-number`
      );
    });

    it('builds correct sign in url', function () {
      req.query = { redirectUrl: '', state: 'state-value' };

      redirectToIdam('/idam_path', idamServiceStub)(req, res);

      expect(res.redirect).to.have.been.calledOnce.calledWith(
        `${idamUrl}/idam_path?redirect_uri=http%3A%2F%2Fredirect_url&client_id=sscs&response_type=code&state=state-value`
      );
    });
  });

  describe('#getIdamCallback', function () {
    let caseServiceStub,
      trackYourAppealService,
      redirectToIdam,
      idamServiceStub;

    const invokeIdamCallback = async () =>
      getIdamCallback(
        redirectToIdam,
        idamServiceStub,
        caseServiceStub,
        trackYourAppealService
      )(req, res, next);

    describe('called without code', function () {
      it('redirects to idam login', async function () {
        req.query = {};

        const redirectToIdam = sinon.stub();
        await getIdamCallback(redirectToIdam, null, null, null)(req, res, next);

        expect(redirectToIdam).to.have.been.calledOnce.calledWith(req, res);
      });

      it('throw error trying to destroy session', async function () {
        req.query = {};
        req.session.destroy.yields(error);

        const redirectToIdam = sinon.stub();

        try {
          await getIdamCallback(
            redirectToIdam,
            null,
            null,
            null
          )(req, res, next);
        } catch (err) {
          expect(AppInsights.trackException).to.have.been.calledOnce.calledWith(
            error
          );
        }
      });
    });

    const accessToken = 'someAccessToken';

    describe('throw exception because idam 400', function () {
      it('throw error', async function () {
        const error400 = new Error('400 Not Authorised');

        req.query = {
          code: 'badCode',
        };
        const redirectToIdam = sinon.stub();
        idamServiceStub = {
          getToken: sinon.stub().rejects(error400),
        } as Partial<IdamService> as IdamService;

        caseServiceStub = {} as CaseService;

        await invokeIdamCallback();

        expect(AppInsights.trackEvent).to.have.been.called.calledWith(
          'MYA_IDAM_CODE_AUTH_ERROR'
        );
        expect(AppInsights.trackEvent).to.have.been.called.calledWith(
          'MYA_LOGIN_FAIL'
        );
      });
    });

    describe('throw exception because no caseId', function () {
      it('throw error', async function () {
        sinon.stub(Service2Service, 'generateToken').resolves('3');
        const accessToken = 'someAccessToken';
        req.query = { code: 'someCode' };
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
        } as Partial<IdamService> as IdamService;

        caseServiceStub = {
          getCasesForCitizen: sinon.stub().resolves({
            statusCode: 200,
            body: [{ online_hearing_id: '1', appellant_name: 'John Smith' }],
          }),
        } as Partial<CaseService> as CaseService;

        await invokeIdamCallback();

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

    describe('on success with MYA enabled', function () {
      beforeEach(async function () {
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
        } as Partial<IdamService> as IdamService;
        caseServiceStub = {
          getCasesForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [caseDetails] }),
        } as Partial<CaseService> as CaseService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', function () {
        expect(
          caseServiceStub.getCasesForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('logs AppInsights trace log', function () {
        expect(AppInsights.trackTrace).to.have.been.calledOnce.calledWith(
          `[12345] - User logged in successfully as someEmail@example.com`
        );
      });

      it('publishes AppInsights event', function () {
        expect(AppInsights.trackEvent).to.have.been.calledOnce.calledWith(
          `MYA_LOGIN_SUCCESS`
        );
      });

      it('redirects to task list page', function () {
        expect(res.redirect).to.have.been.calledWith(Paths.status);
      });
    });

    describe('check hideHearing flag with MYA enabled', function () {
      beforeEach(async function () {
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
        } as Partial<IdamService> as IdamService;
        caseServiceStub = {
          getCasesForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [caseDetails] }),
        } as Partial<CaseService> as CaseService;
      });
    });

    describe('cannot find case with MYA enabled', function () {
      beforeEach(async function () {
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
        } as Partial<IdamService> as IdamService;
        caseServiceStub = {
          getCasesForCitizen: sinon
            .stub()
            .resolves({ statusCode: 200, body: [] }),
        } as Partial<CaseService> as CaseService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
      });

      it('calls the online hearing service', function () {
        expect(
          caseServiceStub.getCasesForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('redirects to assign case page', function () {
        expect(res.redirect).to.have.been.calledWith(Paths.assignCase);
      });
    });

    describe('finds multiple cases with MYA enabled', function () {
      beforeEach(async function () {
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
        } as Partial<IdamService> as IdamService;
        caseServiceStub = {
          getCasesForCitizen: sinon.stub().resolves({
            statusCode: 200,
            body: [caseDetails, caseDetails],
          }),
        } as Partial<CaseService> as CaseService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };
      });

      it('calls the online hearing service', async function () {
        isFeatureEnabledStub.returns(false);

        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(
          caseServiceStub.getCasesForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('loads select case page', async function () {
        isFeatureEnabledStub.returns(false);

        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(res.redirect).to.have.been.calledWith(Paths.selectCase);
      });

      it('loads active cases page', async function () {
        isFeatureEnabledStub.returns(true);
        await getIdamCallback(
          redirectToIdam,
          idamServiceStub,
          caseServiceStub,
          trackYourAppealService
        )(req, res, next);
        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(res.redirect).to.have.been.calledWith(Paths.activeCases);
      });
    });

    describe('selects a case by case id with MYA enabled', function () {
      beforeEach(async function () {
        req.query = { code: 'someCode', state: 'tya-number', caseId: '11111' };
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
        } as Partial<IdamService> as IdamService;
        caseServiceStub = {
          getCasesForCitizen: sinon.stub().resolves({
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
        } as Partial<CaseService> as CaseService;

        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: { hearingType: 'cor' } }),
        };
      });

      it('calls the online hearing service', async function () {
        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(
          caseServiceStub.getCasesForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
      });

      it('redirects to taskList', async function () {
        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(
          caseServiceStub.getCasesForCitizen
        ).to.have.been.calledOnce.calledWith(
          'someEmail@example.com',
          'tya-number',
          req
        );
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.taskList);
      });

      it('sets the hearing', async function () {
        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(req.session.case).to.be.eql({
          case_id: 11111,
          online_hearing_id: '1',
          case_reference: '11111',
          appellant_name: 'John Smith',
        });
      });

      it('redirects to task list page', async function () {
        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({ appeal: {} }),
        };

        await invokeIdamCallback();

        expect(req.session.accessToken).to.be.eql(accessToken);
        expect(req.session.tya).to.be.eql('tya-number');
        expect(res.redirect).to.have.been.calledWith(Paths.status);
      });
    });
  });
});
